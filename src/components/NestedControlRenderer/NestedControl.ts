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
import { FileProperty } from "./properties/FileProperty";
import { NestedControlError } from "./NestedControlError";
import { IBinding, IControlStates } from "./interfaces";


const manifestCache = new PromiseCache();
const LOADED_CONTROLS = new Set<string>();


export interface IOptions {
    onGetBindings: () => {
        [key: string]: IBinding;
    }
    /**
    * PCF Context of parent control using this class. It will be used as base for nested control PCF context.
    */
    parentPcfContext: ComponentFramework.Context<any, any>;

    /**
     * Custom PCF to be rendered, if not provided you will get Base Control props.
     */
    /**
* Container element into which the control will be rendered in.
*/
    onGetContainerElement?: () => HTMLDivElement;
    onGetControlName?: () => string;
    callbacks?: {
        onInit?: (instance: NestedControl) => void;
        onGetControlStates?: () => IControlStates | undefined
        onNotifyOutputChanged?: (ouputs: any) => void;

        /**
         * Triggers when the control changes a state that should be visible in control renderer UI (for example loading)
         */
        onControlStateChanged?: () => void;
    },
    overrides?: {
        onGetProps?: (props: IControl<any, any, any, any>) => IControl<any, any, any, any>;
        onRender?: (control: NestedControl, defaultRender: () => Promise<void>) => void;
        onUnmount?: (control: NestedControl, defaultUnmount: () => void) => void;
    }
}

export class NestedControl {
    private _options: IOptions;
    private _pendingInitialRender: boolean = false;
    private _errorMessage: string = '';
    private _properties: Map<string, Property> = new Map();
    private _lastRenderedControlName: string = '';
    private _hasCustomPcfBeenMounted: boolean = false;
    private _customControlInstance: ComponentFramework.StandardControl<any, any> | null = null;
    private _customControlId: string = '';
    private _manifest: Manifest | null = null;
    private _loading: boolean = false;
    private _props: IControl<IParameters, any, any, any> | undefined;
    private _mutationObserver: MutationObserver | null = new MutationObserver((mutations) => this._checkIfControlLoadedToDom(mutations));
    private _destroyed: boolean = false;
    private _initialized: boolean = false;
    private _container: HTMLDivElement | null = null;
    private _hasControlBeenPatched: boolean = false;

    constructor(options: IOptions) {
        this._options = options;
        this._getPropertiesFromBindings()
    }

    public getProps(): IControl<IParameters, any, any, any> {
        if (!this._props) {
            return this.refreshProps()
        }
        return this._props;
    }

    public refreshProps() {
        const parameters: { [name: string]: IProperty } = this.getParameters();
        const props: IControl<any, any, any, any> = {
            context: {
                ...this.getOptions().parentPcfContext,
                parameters: parameters,
                mode: Object.create(this.getOptions().parentPcfContext.mode, {
                    isControlDisabled: {
                        value: this.getOptions().callbacks?.onGetControlStates?.()?.isControlDisabled ?? false
                    }
                }),
                factory: {
                    ...this.getOptions().parentPcfContext.factory,
                    requestRender: () => this.render()
                },
                fluentDesignLanguage: this._getFluentDesignLanguage(this.getOptions().parentPcfContext.fluentDesignLanguage)
            },
            parameters: parameters,
            onNotifyOutputChanged: (outputs: any) => {
                Object.entries(outputs).map(([name, output]) => {
                    this.getOptions().onGetBindings()[name]?.onNotifyOutputChanged?.(output)
                })
                this.getOptions().callbacks?.onNotifyOutputChanged?.(outputs);
            }
        }
        const result = this._overrideDecorator(() => props, this.getOptions().overrides?.onGetProps, () => [props] as any);
        this._props = result;
        return result;
    }

    public getParameters() {
        const parameters: { [name: string]: IProperty } = {};
        [...this._properties.entries()].map(([name, prop]) => {
            const binding = this.getOptions().onGetBindings()[name];
            //binding might not exist if we have switched controls
            if (binding) {
                const parameter = prop.getParameter();
                parameters[name] = {
                    ...parameter,
                    error: binding.error ?? false,
                    errorMessage: binding.errorMessage ?? null,
                    type: prop.dataType
                };
            }
        })
        return parameters;
    }

    public isLoading() {
        return this._loading;
    }

    public setLoading(loading: boolean) {
        this._loading = loading;
    }

    public getOptions() {
        return this._options;
    }

    public async render() {
        if (this._pendingInitialRender || this._destroyed) {
            return;
        }
        await this._getPropertiesFromBindings();
        if (this._destroyed) {
            return;
        }
        this.refreshProps();
        //if we detect a change in name, unmount the component before render
        if (this._lastRenderedControlName && this._lastRenderedControlName !== this.getControlName()) {
            this.unmount(true)
        }
        if (!this._customControlId) {
            this._customControlId = crypto.randomUUID();
        }
        await this._overrideDecorator(async () => this._render(), this.getOptions().overrides?.onRender, () => [this, async () => this._render()] as any);
        if (this._destroyed) {
            return;
        }
        this._lastRenderedControlName = this.getControlName();
    }
    public unmount(softUnmount?: boolean) {
        this._overrideDecorator(() => this._unmount(), this.getOptions().overrides?.onUnmount, () => [this, () => this._unmount()] as any)
        this._lastRenderedControlName = '';
        this._hasCustomPcfBeenMounted = false;
        this._hasControlBeenPatched = false;
        this._customControlId = '';
        this._mutationObserver?.disconnect();
        if (!softUnmount) {
            this._mutationObserver = null;
            this._customControlInstance = null;
            this._props = undefined;
            this._container = null;
            this._properties.clear();
            this._destroyed = true;
        }
    }
    public getErrorMessage(): string {
        return this._errorMessage;
    }
    public setError(message?: string) {
        this._errorMessage = message ?? '';
    }
    public isMountedPcfComponent() {
        return this._hasCustomPcfBeenMounted;
    }

    public getContainer() {
        let container = this.getOptions().onGetContainerElement?.();
        if (container) {
            this._container = container;
            return container;
        }
        if (this._container) {
            return this._container;
        }
        if (!container && this._container) {
            return this._container;
        }
        throw new Error('Cannot render control if no container is specified!');
    }

    public getControlName() {
        const controlName = this.getOptions().onGetControlName?.();
        if (!controlName) {
            throw new Error("Cannot render control if it's name is not specified!");
        }
        return controlName;
    }

    public getBindings() {
        return this.getOptions().onGetBindings();
    }

    public getCustomControlId() {
        return this._customControlId;
    }

    private _overrideDecorator<T extends any[], K>(defaultMethod: () => K | Promise<K>, override?: (...args: T) => any, getOverrideArgs?: () => T) {
        if (override && getOverrideArgs) {
            return override(...getOverrideArgs());
        }
        else {
            return defaultMethod();
        }
    }

    private _unmount() {
        (this.getOptions().parentPcfContext as any).factory.unbindDOMComponent(this._customControlId)

    }
    private async _render(): Promise<void> {
        try {
            if (!this._lastRenderedControlName) {
                this._errorMessage = '';
                this._pendingInitialRender = true;
                const controlName = this.getControlName();
                if (!LOADED_CONTROLS.has(controlName)) {
                    this._loading = true;
                    this.getOptions().callbacks?.onControlStateChanged?.();
                }
                this._mutationObserver?.observe(this.getContainer(), { childList: true, subtree: true });
                try {
                    this._manifest = await this._getManifest(controlName);
                }
                catch (err) {
                    throw new NestedControlError({
                        message: `Could not find control named ${controlName} on this environment.`
                    }, this);
                }
                if (this._destroyed) {
                    return;
                }
                try {
                    const properties: any = {
                        controlstates: this.getOptions().callbacks?.onGetControlStates?.() ?? {},
                        parameters: this._getCustomControlParameters(this._manifest!),
                        childeventlisteners: [{
                            eventname: "onInit",
                            eventhandler: (control: ComponentFramework.StandardControl<any, any>) => {
                                this._customControlInstance = control;
                                this._patchUpdateView(this._customControlInstance!, this._manifest!);
                            }
                        }]
                    };
                    const component = (this.getOptions().parentPcfContext as any).factory.createComponent(controlName, this._customControlId, properties);
                    (this.getOptions().parentPcfContext as any).factory.bindDOMElement(component, this.getContainer());
                    this._hasCustomPcfBeenMounted = true;
                }
                catch (err) {
                    throw new NestedControlError(err as any, this);
                }
                this._pendingInitialRender = false;
            }
            //the PCF did not change, just call updateView
            else {
                this._customControlInstance?.updateView?.(this.getProps().context)
            }
        }
        catch (err) {
            this._pendingInitialRender = false;
            this._pendingInitialRender = false;
            console.error(err);
        }
    }

    private _getCustomControlNameWithoutPrefix() {
        const parts = this._lastRenderedControlName.split('_');
        return parts[1] ?? parts[0];
    }

    private _checkIfControlLoadedToDom(mutations: MutationRecord[]) {
        try {
            mutations.map(mutation => {
                const target = mutation.target as HTMLElement;
                if (target.classList.contains(this._getCustomControlNameWithoutPrefix())) {
                    this._loading = false;
                    LOADED_CONTROLS.add(this._lastRenderedControlName);
                    this._mutationObserver?.disconnect();
                    if (!this._customControlInstance) {
                        this._unmount();
                        throw new NestedControlError({
                            message: `Custom control ${this._lastRenderedControlName} does not expose it's instance through fireEvent. Please add fireEvent to init() to avoid unintentional behavior.`
                        }, this)
                    }
                    else {
                        this.getOptions().callbacks?.onControlStateChanged?.();
                    }
                }
            });
        }
        catch(err) {
            console.error(err);
        }
    }

    private async _getPropertiesFromBindings() {
        const promises: Promise<boolean>[] = [];
        Object.entries(this.getOptions().onGetBindings()).map(([name, binding]) => {
            if (!this._properties.get(name)) {
                const getBinding = () => this.getOptions().onGetBindings()[name];
                const propertyInstance = this._getPropertyInstance(getBinding);
                const metadata = getBinding()?.metadata;
                //push to promise only if we need to fetch the metadata asynchronously
                if (metadata?.attributeName && metadata.entityName) {
                    promises.push(propertyInstance.init());
                }
                else {
                    propertyInstance.init();
                }
                this._properties.set(name, propertyInstance);
            }
        })
        if (promises.length > 0) {
            await Promise.all(promises);
        }
        if (!this._initialized) {
            this._initialized = true;
            this.getOptions().callbacks?.onInit?.(this)
        }
    }

    private _getPropertyInstance(onGetBinding: () => IBinding) {
        switch (onGetBinding().type) {
            case DataTypes.TwoOptions:
            case DataTypes.OptionSet:
            case DataTypes.MultiSelectOptionSet: {
                return new OptionSetProperty(this.getOptions(), onGetBinding);
            }
            case DataTypes.DateAndTimeDateAndTime:
            case DataTypes.DateAndTimeDateOnly: {
                return new DateProperty(this.getOptions(), onGetBinding);
            }
            case DataTypes.WholeNone:
            case DataTypes.Decimal:
            case DataTypes.Currency:
            case DataTypes.WholeDuration: {
                return new NumberProperty(this.getOptions(), onGetBinding);
            }
            case DataTypes.LookupSimple:
            case DataTypes.LookupOwner:
            case DataTypes.LookupCustomer:
            case DataTypes.LookupRegarding: {
                return new LookupProperty(this.getOptions(), onGetBinding);
            }
            case DataTypes.File:
            case DataTypes.Image: {
                return new FileProperty(this.getOptions(), onGetBinding)
            }
            default: {
                return new TextProperty(this.getOptions(), onGetBinding);
            }
        }
    }
    private _getPrimaryBindingName(): string {
        const primaryBinding = Object.entries(this.getOptions().onGetBindings()).find(([key, binding]) => !binding.isStatic)?.[0];
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
            const result = await this.getOptions().parentPcfContext.webAPI.retrieveMultipleRecords('customcontrol', `?$select=name,manifest&$filter=name eq '${controlName}'`);
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
                    if (property.isBindingProperty) {
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
                        const binding = this.getOptions().onGetBindings()[bindingName];
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
                    let binding = this.getOptions().onGetBindings()[property.name];
                    let bindingName = property.name;
                    if (!binding && !property.isBindingProperty) {
                        return;
                    }
                    if (!binding) {
                        bindingName = this._getPrimaryBindingName();
                        binding = this.getOptions().onGetBindings()[bindingName]
                    }
                    binding.onNotifyOutputChanged?.(value);
                    const boundBindings = Object.entries(this.getOptions().onGetBindings()).filter(([key, binding]) => !binding.isStatic);
                    const outputs: any = {};
                    boundBindings.map(([key, binding]) => {
                        outputs[key] = key === bindingName ? value : this.getProps().parameters[bindingName].raw
                    })
                    this.getOptions().callbacks?.onNotifyOutputChanged?.(outputs)
                }
            }
        })
        const nonManifestParameters = Object.entries(bindingParameters).filter(([key, value]) => !manifest.control.properties.get(key));
        nonManifestParameters.map(([key, parameter]) => {
            result[key] = {
                Static: true,
                Primary: false,
                Type: parameter.type ?? 'SingleLine.Text',
                Value: parameter.raw,
                Usage: 0
            }
        })
        return result;
    }
    private _patchUpdateView(control: ComponentFramework.StandardControl<any, any>, manifest: Manifest) {
        if (this._hasControlBeenPatched) {
            return;
        }
        let originalContext: ComponentFramework.Context<any, any> | null = null;
        const originalUpdateView = control.updateView.bind(control);
        control.updateView = (context) => {
            if (!originalContext) {
                originalContext = context;
            }
            originalUpdateView(this._patchContext(manifest, originalContext));
        }
        this._hasControlBeenPatched = true;
    }
    private _patchContext(manifest: Manifest, originalContext: ComponentFramework.Context<any, any>) {
        const context = this.getProps().context;
        const contextParameters = originalContext.parameters;
        const parameters = this.getProps().parameters;
        const manifestBindingProperty = this._getManifestPrimaryBinding(manifest);
        const primaryBindingName = this._getPrimaryBindingName();
        context.resources = originalContext.resources;
        context.events = originalContext.events;
        context.parameters = {
            ...contextParameters,
            ...parameters,
            [manifestBindingProperty.name]: parameters[primaryBindingName]
        }

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