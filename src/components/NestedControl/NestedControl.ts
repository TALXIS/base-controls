import { DataType, DataTypes, PromiseCache } from "@talxis/client-libraries";
import { Property } from "./properties/Property";
import { TextProperty } from "./properties/TextProperty";
import { OptionSetProperty } from "./properties/OptionSetProperty";
import { NumberProperty } from "./properties/NumberProperty";
import { DateProperty } from "./properties/DateProperty";
import { LookupProperty } from "./properties/LookupProperty";
import { IControl, IParameters, IProperty } from "../../interfaces";
import { ControlTheme, IFluentDesignState } from "../../utils";
import { Manifest } from "./manifest";


const manifestCache = new PromiseCache();
const LOADED_CONTROLS = new Set<string>();

export interface IBinding {
    type: DataType;
    isStatic: boolean;
    value: any;
    error?: boolean;
    errorMessage?: string;
    metadata?: {
        entityName: string;
        attributeName: string;
    },
    onNotifyOutputChanged?: (newValue: any) => void;
}

export interface IControlStates {
    isControlDisabled?: boolean;
}

export interface IOptions {
    onGetControlName: () => string;
    onGetBindings: () => {
        [key: string]: IBinding;
    }
    /**
    * PCF Context of parent control using this class. It will be used as base for nested control PCF context.
    */
    parentPcfContext: ComponentFramework.Context<any, any>;

    /**
     * Container element into which the control will be rendered in.
     */
    containerElement: HTMLDivElement;

    /**
     * Custom PCF to be rendered, if not provided you will get Base Control props.
     */
    callbacks?: {
        onInit?: () => void;
        onGetControlStates?: () => IControlStates | undefined
        onNotifyOutputChanged?: (ouputs: any) => void;
        /**
         * Triggers when the control changes a state that should be visible in control renderer UI (for example loading)
         */
        onControlStateChanged?: () => void;
    },
    overrides?: {
        onGetProps?: (props: IControl<any, any, any, any>) => IControl<any, any, any, any>;
        onRender?: (props: IControl<any, any, any, any>, container: HTMLDivElement, defaultRender: () => Promise<void>) => void;
        onUnmount?: (isPcfComponent: boolean, container: HTMLDivElement, defaultUnmount: () => void) => void;
    }
}

export class NestedControl {
    private _options: IOptions;
    private _pendingInitialRender: boolean = false;
    private _errorMessage: string = '';
    private _properties: Map<string, Property> = new Map();
    private _lastRenderedControlName: string = '';
    private _customControlInstance: ComponentFramework.StandardControl<any, any> | null = null;
    private _customControlContext: ComponentFramework.Context<any, any> | null = null;
    private _customControlId: string = '';
    private _manifest: Manifest | null = null;
    private _loading: boolean = false;
    private _mutationObserver = new MutationObserver((mutations) => this._checkIfControlLoadedToDom(mutations));

    constructor(options: IOptions) {
        this._options = options;
        this._init();
    }

    public getProps(): IControl<IParameters, any, any, any> {
        const parameters: { [name: string]: IProperty } = {};
        [...this._properties.entries()].map(([name, prop]) => {
            parameters[name] = {
                ...prop.getParameter(),
                error: this._options.onGetBindings()[name].error ?? false,
                errorMessage: this._options.onGetBindings()[name].errorMessage ?? null,
                type: prop.dataType
            };
        })
        const props: IControl<any, any, any, any> = {
            context: {
                ...this._options.parentPcfContext,
                parameters: parameters,
                mode: Object.create(this._options.parentPcfContext.mode, {
                    isControlDisabled: {
                        value: this?._options.callbacks?.onGetControlStates?.()?.isControlDisabled ?? false
                    }
                }),
                fluentDesignLanguage: this._getFluentDesignLanguage(this._options.parentPcfContext.fluentDesignLanguage)
            },
            parameters: parameters,
            onNotifyOutputChanged: (outputs: any) => {
                Object.entries(outputs).map(([name, output]) => {
                    this._options.onGetBindings()[name]?.onNotifyOutputChanged?.(output)
                })
                this._options.callbacks?.onNotifyOutputChanged?.(outputs);
            }
        }
        return this._overrideDecorator(() => props, this._options.overrides?.onGetProps, () => [props] as any);
    }

    public isLoading() {
        return this._loading;
    }

    public async render() {
        if (this._pendingInitialRender) {
            return;
        }
        //if we detect a change in name, unmount the component before render
        if (this._lastRenderedControlName && this._lastRenderedControlName !== this._options.onGetControlName()) {
            this.unmount();
        }
        try {
            await this._overrideDecorator(async () => this._render(), this._options.overrides?.onRender, () => [this.getProps(), this._options.containerElement, async () => this._render()] as any);
            this._lastRenderedControlName = this._options.onGetControlName();
        }
        catch (err) {
            this._triggerError(err as string);
        }
    }
    public unmount() {
        this._overrideDecorator(() => this._unmount(), this._options.overrides?.onUnmount, () => [this._customControlInstance ? true : false, this._options.containerElement, () => this._unmount()] as any)
        this._lastRenderedControlName = '';
    }
    public getErrorMessage(): string {
        return this._errorMessage;
    }
    private _overrideDecorator<T extends any[], K>(defaultMethod: () => K | Promise<K>, override?: (...args: T) => any, getOverrideArgs?: () => T) {
        if (override && getOverrideArgs) {
            return override(...getOverrideArgs());
        }
        else {
            return defaultMethod();
        }
    }

    private _triggerError(errorMessage: string) {
        this._errorMessage = errorMessage;
        this._loading = false;
        this._options.callbacks?.onControlStateChanged?.();
    }

    private _unmount() {
        this._customControlInstance?.destroy();
        this._customControlInstance = null;
        this._customControlId = '';
        this._customControlContext = null;
        this._mutationObserver.disconnect();
    }
    private async _render(): Promise<void> {
        if (!this._lastRenderedControlName) {
            this._errorMessage = '';
            this._pendingInitialRender = true;
            const controlName = this._options.onGetControlName();
            if (!LOADED_CONTROLS.has(controlName)) {
                this._loading = true;
                this._options.callbacks?.onControlStateChanged?.();
            }
            this._mutationObserver.observe(this._options.containerElement, { childList: true, subtree: true });
            this._customControlId = crypto.randomUUID();
            try {
                this._manifest = await this._getManifest(controlName);
                const properties: any = {
                    controlstates: this._options.callbacks?.onGetControlStates?.() ?? {},
                    parameters: this._getCustomControlParameters(this._manifest),
                    childeventlisteners: [{
                        eventname: "onInit",
                        eventhandler: (object: any) => {
                            this._customControlInstance = object.instance;
                            this._customControlContext = object.context;
                            this._patchContext(object.context, this._manifest!);
                        }
                    }]
                };
                const component = (this._options.parentPcfContext as any).factory.createComponent(controlName, this._customControlId, properties);
                (this._options.parentPcfContext as any).factory.bindDOMElement(component, this._options.containerElement);
            }
            catch (err) {
                throw new Error(`Could not find control named ${controlName} on this environment.`);
            }
            finally {
                this._pendingInitialRender = false;
            }
        }
        //the PCF did not change, just call updateView
        else {
            this._customControlInstance?.updateView?.(this._patchContext(this._customControlContext!, this._manifest!))
        }
    }

    private _getCustomControlNameWithoutPrefix() {
        const parts = this._lastRenderedControlName.split('_');
        return parts[1] ?? parts[0];
    }

    private _checkIfControlLoadedToDom(mutations: MutationRecord[]) {
        mutations.map(mutation => {
            const target = mutation.target as HTMLElement;
            if (target.classList.contains(this._getCustomControlNameWithoutPrefix())) {
                this._loading = false;
                LOADED_CONTROLS.add(this._lastRenderedControlName);
                this._mutationObserver.disconnect();
                if (!this._customControlInstance) {
                    //TODO: call unmount, but make it so unbindDOMComponent always gets triggered there unless specified not to from above
                    (this._options.parentPcfContext as any).factory.unbindDOMComponent(this._customControlId);
                    this._triggerError(`Custom control ${this._lastRenderedControlName} does not expose it's instance through fireEvent. Please add fireEvent to init() to avoid unintentional behavior.`)
                }
                else {
                    this._options.callbacks?.onControlStateChanged?.();
                }
            }
        });
    }

    private async _init() {
        const promises: Promise<boolean>[] = [];
        Object.entries(this._options.onGetBindings()).map(([name, binding]) => {
            const getBinding = () => this._options.onGetBindings()[name];
            const propertyInstance = this._getPropertyInstance(getBinding);
            promises.push(propertyInstance.init());
            this._properties.set(name, propertyInstance);
        })
        /*          await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(null)
                    }, 2000);
                }) */
        await Promise.all(promises);
        this._options.callbacks?.onInit?.()
    }

    private _getPropertyInstance(onGetBinding: () => IBinding) {
        switch (onGetBinding().type) {
            case DataTypes.TwoOptions:
            case DataTypes.OptionSet:
            case DataTypes.MultiSelectOptionSet: {
                return new OptionSetProperty(this._options, onGetBinding);
            }
            case DataTypes.DateAndTimeDateAndTime:
            case DataTypes.DateAndTimeDateOnly: {
                return new DateProperty(this._options, onGetBinding);
            }
            case DataTypes.WholeNone:
            case DataTypes.Decimal:
            case DataTypes.Currency:
            case DataTypes.WholeDuration: {
                return new NumberProperty(this._options, onGetBinding);
            }
            case DataTypes.LookupSimple:
            case DataTypes.LookupOwner:
            case DataTypes.LookupCustomer:
            case DataTypes.LookupRegarding: {
                return new LookupProperty(this._options, onGetBinding);
            }
            default: {
                return new TextProperty(this._options, onGetBinding);
            }
        }
    }
    private _getPrimaryBindingName(): string {
        const primaryBinding = Object.entries(this._options.onGetBindings()).find(([key, binding]) => !binding.isStatic)?.[0];
        if (!primaryBinding) {
            throw new Error('Control needs to have atleast one non-static binding!');
        }
        return primaryBinding;
    }
    private _getManifestPrimaryBinding(manifest: Manifest) {
        return [...manifest.control.properties.values()].find(prop => prop.isBindingProperty)!;
    }
    private async _getManifest(controlName: string) {
        return manifestCache.get(controlName, async () => {
            const result = await this._options.parentPcfContext.webAPI.retrieveMultipleRecords('customcontrol', `?$select=name,manifest&$filter=name eq '${controlName}'`);
            const manifestXmlString = result.entities[0].manifest;
            return new Manifest(manifestXmlString);
        })
    }
    private _getCustomControlParameters(manifest: Manifest) {
        const result: { [name: string]: any } = {};
        const bindingParameters = this.getProps().parameters;
        const manifestProperties = [...manifest.control.properties.values()];
        manifestProperties.map(property => {
            result[property.name] = {
                Static: property.usage === 'input',
                Primary: property.isBindingProperty,
                //if no ofType is present, there is a type group and we need to get the type from the passed parameters above
                Type: property.ofType ?? bindingParameters[property.name]?.type ?? 'SingleLine.Text',
                //if static, we take the value that came from the parameter above
                Value: (() => {
                    const binding = bindingParameters[property.name];
                    if (binding) {
                        return binding.raw;
                    }
                    if (property.usage === 'input') {
                        return property.defaultValue;
                    }
                    if(property.isBindingProperty) {
                        return bindingParameters[this._getPrimaryBindingName()].raw;
                    }
                })(),
                Usage: (() => {
                    switch (property.usage) {
                        case 'bound': {
                            return 3;
                        }
                        case 'input':
                        case 'output': {
                            return 0;
                        }
                    }
                })(),
                Attributes: (() => {
                    const getBindingMetadata = (bindingName: string) => {
                        const binding = this._options.onGetBindings()[bindingName];
                        return binding?.metadata ? {
                            EntityLogicalName: binding.metadata.entityName,
                            LogicalName: binding.metadata.attributeName
                        } : undefined;
                    };
                    const propertyBindingMetadata = getBindingMetadata(property.name);

                    if (propertyBindingMetadata) {
                        return propertyBindingMetadata;
                    }
                
                    if (property.isBindingProperty) {
                        return getBindingMetadata(this._getPrimaryBindingName());
                    }
                
                    return undefined;
                })(),
                Callback: (value: any) => {
                    let binding = this._options.onGetBindings()[property.name];
                    let bindingName = property.name;
                    if (!binding && !property.isBindingProperty) {
                        return;
                    }
                    if(!binding) {
                        bindingName = this._getPrimaryBindingName();
                        binding = this._options.onGetBindings()[bindingName]
                    }
                    binding.onNotifyOutputChanged?.(value);
                    const boundBindings = Object.entries(this._options.onGetBindings()).filter(([key, binding]) => !binding.isStatic);
                    const outputs: any = {};
                    boundBindings.map(([key, binding]) => {
                        outputs[key] = key === property.name ? value : this.getProps().parameters[bindingName].raw
                    })
                    this._options.callbacks?.onNotifyOutputChanged?.(outputs)
                }
            }
        })
        return result;
    }
    private _patchContext(context: ComponentFramework.Context<any, any>, manifest: Manifest) {
        const props = this.getProps();
        const parameters = props.parameters;
        const contextParameters = context.parameters;
        const manifestBindingProperty = this._getManifestPrimaryBinding(manifest);
        const primaryBindingName = this._getPrimaryBindingName();

        Object.defineProperty(context, 'mode', {
            get: () => {
                return props.context.mode;
            },
            set: () => { }
        });
        Object.defineProperty(context, 'fluentDesignLanguage', {
            get: () => {
                return props.context.fluentDesignLanguage
            },
            set: () => { }
        })
        Object.defineProperty(context, 'parameters', {
            get: () => {
                return {
                    ...contextParameters,
                    ...parameters,
                    [manifestBindingProperty.name]: parameters[primaryBindingName]
                }
            },
            set: () => {
            }
        })
        Object.defineProperty(context.factory, 'requestRender', {
            configurable: true,
            get: () => {
                return () => this.render();
            },
            set: () => { }
        })
        return context;
    }
    private _getFluentDesignLanguage(fluentDesignLanguage?: IFluentDesignState): IFluentDesignState {
        const v8Theme = ControlTheme.GetV8ThemeFromFluentDesignLanguage(fluentDesignLanguage);
        return ControlTheme.GenerateFluentDesignLanguage(v8Theme.palette.themePrimary, v8Theme.semanticColors.bodyBackground, v8Theme.semanticColors.bodyText, {
            v8FluentOverrides: fluentDesignLanguage?.v8FluentOverrides,
            applicationTheme: fluentDesignLanguage?.applicationTheme ?? v8Theme
        })
    }
}