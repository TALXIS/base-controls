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
        onControlLoaded?: () => void
    },
    overrides?: {
        onGetProps?: () => ((props: IControl<any, any, any, any>) => IControl<any, any, any, any>) | undefined,
        onRender?: () => ((container: HTMLDivElement, props: IControl<any, any, any, any>) => void) | undefined;
        onUnmount?: () => ((container: HTMLDivElement) => void) | undefined;
    }
}

export class NestedControl {
    private _options: IOptions;
    private _properties: Map<string, Property> = new Map();
    private _renderedCustomControlName: string = '';
    private _customControlInstance: ComponentFramework.StandardControl<any, any> | null = null;
    private _customControlContext: ComponentFramework.Context<any, any> | null = null;
    private _customControlId: string = '';
    private _manifest: Manifest | null = null;
    private _loading: boolean = false;
    private _mutationObserver = new MutationObserver((mutations) => this._checkIfControlLoadedToDom(mutations, this._manifest!));

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
                mode:  Object.create(this._options.parentPcfContext.mode, {
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
        const override = this._options.overrides?.onGetProps?.();
        if (override) {
            return override(props);
        }
        return props;
    }

    public isLoading() {
        return this._loading;
    }

    public async render() {
        //if we detect change in PCF name, unmount it first
        if (this._renderedCustomControlName && this._options.onGetControlName() !== this._renderedCustomControlName) {
            this.unmount();
        }
        const override = this._options.overrides?.onRender?.();
        if (override) {
            return override(this._options.containerElement, this.getProps());
        }
        //if the PCF name changed, reinitialize
        if (this._options.onGetControlName() !== this._renderedCustomControlName) {
            this._renderedCustomControlName = this._options.onGetControlName();
            if(!LOADED_CONTROLS.has(this._renderedCustomControlName)) {
                this._loading = true;
            }
            this._mutationObserver.observe(this._options.containerElement, { childList: true, subtree: true });
            this._customControlId = crypto.randomUUID();
            this._manifest = await this._getManifest(this._renderedCustomControlName);
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
            const component = (this._options.parentPcfContext as any).factory.createComponent(this._renderedCustomControlName, this._customControlId, properties);
            (this._options.parentPcfContext as any).factory.bindDOMElement(component, this._options.containerElement);
        }
        //the PCF did not change, just call updateView
        else {
            this._customControlInstance?.updateView?.(this._patchContext(this._customControlContext!, this._manifest!))
        }
    }

    //TODO: unify this
    public unmount() {
        const override = this._options.overrides?.onUnmount?.();
        if (override) {
            override(this._options.containerElement);
        }
        this._customControlInstance?.destroy();
        this._renderedCustomControlName = '';
        this._mutationObserver.disconnect();
    }

    private _getCustomControlNameWithoutPrefix() {
        const parts = this._renderedCustomControlName.split('_');
        return parts[1] ?? parts[0];
    }

    private _checkIfControlLoadedToDom(mutations: MutationRecord[], manifest: Manifest) {
        mutations.map(mutation => {
            const target = mutation.target as HTMLElement;
            if(target.classList.contains(this._getCustomControlNameWithoutPrefix())) {
                this._loading = false;
                this._options.callbacks?.onControlLoaded?.();
                LOADED_CONTROLS.add(this._renderedCustomControlName);
                this._mutationObserver.disconnect();
                if(!this._customControlInstance) {
                    console.error(`Custom control ${this._renderedCustomControlName} does not expose it's instance through fireEvent. Please add fireEvent to init() to avoid unintentional behavior.`);
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
    private async _getManifest(controlName: string) {
        return manifestCache.get(controlName, async () => {
            const result = await this._options.parentPcfContext.webAPI.retrieveMultipleRecords('customcontrol', `?$select=name,manifest&$filter=name eq '${controlName}'`);
            const manifestXmlString = result.entities[0].manifest;
            return new Manifest(manifestXmlString);
        })
    }
    private _getCustomControlParameters(manifest: Manifest) {
        let result: { [name: string]: any } = {};
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
                    if (bindingParameters[property.name]?.raw) {
                        return bindingParameters[property.name]?.raw
                    }
                    //if this is a binding, get the value of first bound parameter no matter the name
                    if (property.isBindingProperty) {
                        const bindingName = Object.entries(this._options.onGetBindings()).find(([name, binding]) => !binding.isStatic)?.[0]
                        if (!bindingName) {
                            throw Error('Missing binding!');
                        }
                        return bindingParameters[bindingName]!.raw;
                    }
                    return property.defaultValue;
                })(),
                Usage: (() => {
                    switch (property.usage) {
                        case 'bound': {
                            return 3
                        }
                        case 'input':
                        case 'output': {
                            return 0
                        }
                    }
                })(),
                Attributes: (() => {
/*                     const binding = this._options.onGetBindings()[property.name];
                    if(binding?.metadata) {
                        return {
                            EntityLogicalName: binding.metadata.entityName,
                            LogicalName: binding.metadata.attributeName
                        }
                    }
                    if(property.isBindingProperty) {
                        const binding = Object.values(this._options.onGetBindings()).find(binding => !binding.isStatic);
                        if(binding?.metadata) {
                            return {
                                EntityLogicalName: binding.metadata.entityName,
                                LogicalName: binding.metadata.attributeName
                            }
                        }
                    }
                    return undefined; */
                })(),
                Callback: (value: any) => {
                    let binding = this._options.onGetBindings()[property.name];
                    if (!binding) {
                        const foundBindingName = Object.entries(this._options.onGetBindings()).find(([name, binding]) => !binding.isStatic)?.[0];
                        if (!foundBindingName) {
                            throw new Error('Missing binding!');
                        }
                        binding = this._options.onGetBindings()[foundBindingName];
                    }
                    binding.onNotifyOutputChanged?.(value);
                    //this._options.callbacks?.onNotifyOutputChanged?.();
                }
            }
        })
        //parameters that are not in PCF manifest, but have been set either through bindings or override
        //only static parameters supported like this
        Object.entries(bindingParameters).map(([name, par]) => {
            if (!manifestProperties.find(prop => prop.name === name)) {
                result[name] = {
                    Static: true,
                    Primary: false,
                    Type: par?.type,
                    Value: par?.raw,
                    Usage: 0,
                }
            }
        })
        return result;
    }
    private _patchContext(context: ComponentFramework.Context<any, any>, manifest: Manifest) {
        const props = this.getProps();
        const parameters = props.parameters;
        const contextParameters = context.parameters;
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
                    ...parameters
                }
            },
            set: () => {

            }
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