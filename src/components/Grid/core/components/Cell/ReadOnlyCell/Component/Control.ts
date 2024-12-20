import { DataType, DataTypes, IFieldValidationResult, Manifest, PromiseCache } from "@talxis/client-libraries";
import { Property } from "../Properties/Property";
import { TextProperty } from "../Properties/TextProperty";
import { OptionSetProperty } from "../Properties/OptionSetProperty";
import { IControl, IParameters, IProperty } from "../../../../../../../interfaces";


const manifestCache = new PromiseCache();

export interface IBinding {
    type: DataType;
    isStatic: boolean;
    metadata?: {
        enitityName: string;
        attributeName: string;
    },
    valueGetter: () => any;
    validator?: (value: any) => IFieldValidationResult;
    onNotifyOutputChanged?: (newValue: any) => void;
}

export interface IOptions {
    bindings: {
        [name: string]: IBinding;
    },
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
        onGetCustomControlName?: () => string | undefined;
        onIsControlDisabled?: () => boolean;
    },
    overrides?: {
        onRender?: (isCustomControl: boolean) => ((container: HTMLDivElement, props: IControl<any, any, any, any>) => void) | undefined;
        onUnmount?: (isCustomControl: boolean) => ((container: HTMLDivElement) => void) | undefined;
        onGetProps?: () => ((props: IControl<any, any, any, any>) => IControl<any, any, any, any>) | undefined
    }
}

export class Control {
    private _options: IOptions;
    private _properties: Map<string, Property> = new Map();
    private _customControlName: string = '';
    private _customControlInstance: ComponentFramework.StandardControl<any, any> | null = null;
    private _customControlContext: ComponentFramework.Context<any, any> | null = null;
    private _customControlId: string = '';
    private _manifest: Manifest | null = null;

    constructor(options: IOptions) {
        this._options = options;
        this._init();
    }

    public getProps(): IControl<IParameters, any, any, any> {
        const parameters: { [name: string]: IProperty } = {};
        [...this._properties.entries()].map(([name, prop]) => {
            parameters[name] = prop.getParameter()
        })
        const props: IControl<any, any, any, any> = {
            context: this._options.parentPcfContext,
            parameters: parameters,
            onNotifyOutputChanged: (outputs: any) => {
                Object.entries(outputs).map(([name, output]) => {
                    this._options.bindings[name]?.onNotifyOutputChanged?.(output)
                })
            }
        }
        const override = this._options.overrides?.onGetProps?.();
        if (override) {
            return override(props);
        }
        return props;
    }
    public async render() {
        const currentCustomControlName = this._options.callbacks?.onGetCustomControlName?.() ?? '';
        //if we detect change in PCF name, unmount it first
        if (currentCustomControlName !== this._customControlName) {
            this.unmount();
        }
        const override = this._options.overrides?.onRender?.(!!currentCustomControlName);
        if (override) {
            return override(this._options.containerElement, this.getProps());
        }

        //if the PCF name changed, reinitialize
        if (currentCustomControlName !== this._customControlName) {
            this._customControlName = currentCustomControlName;
            this._customControlId = crypto.randomUUID();
            this._manifest = await this._getManifest(this._customControlName);
            const properties: any = {
                controlstates: {
                    // This is the only implemented controlState parameter
                    isControlDisabled: false
                },
                parameters: this._getCustomControlParameters(this._manifest),
                childeventlisteners: [{
                    eventname: "onEvent",
                    eventhandler: (object: any) => {
                        this._customControlInstance = object.instance;
                        this._customControlContext = object.context;
                        this._patchContext(object.context, this._manifest!);
                    }
                }]
            };
            const component = (this._options.parentPcfContext as any).factory.createComponent(this._customControlName, this._customControlId, properties);
            (this._options.parentPcfContext as any).factory.bindDOMElement(component, this._options.containerElement);
        }
        //the PCF did not change, just call updateView
        else {
            if(!this._customControlInstance) {
                console.error(`Custom control ${this._customControlName} does not expose it's instance through fire event. Please add fireEvent to init() to avoid unintentional behavior.`)
            }
            this._customControlInstance?.updateView?.(this._patchContext(this._customControlContext!, this._manifest!))
        }
    }

    //TODO: unify this
    public unmount() {
        const override = this._options.overrides?.onUnmount?.(!!this._customControlName);
        if (override) {
            override(this._options.containerElement);
        }
        (this._options.parentPcfContext as any).factory.unbindDOMComponent(this._customControlId);
        this._customControlName = '';
    }

    private async _init() {
        const promises: Promise<boolean>[] = [];
        Object.entries(this._options.bindings).map(([name, binding]) => {
            const propertyInstance = this._getPropertyInstance(binding);
            promises.push(propertyInstance.init());
            this._properties.set(name, propertyInstance);
        })
        await Promise.all(promises);
        this._options.callbacks?.onInit?.()
    }
    private _getPropertyInstance(binding: IBinding) {
        switch (binding.type) {
            case DataTypes.LookupSimple:
            case DataTypes.LookupOwner:
            case DataTypes.LookupCustomer: {
                return new TextProperty(binding, this._options);
            }

            case DataTypes.TwoOptions:
            case DataTypes.OptionSet:
            case DataTypes.MultiSelectOptionSet: {
                return new OptionSetProperty(binding, this._options);
            }
            case DataTypes.DateAndTimeDateAndTime:
            case DataTypes.DateAndTimeDateOnly: {
                return new TextProperty(binding, this._options);
            }
            case DataTypes.WholeNone:
            case DataTypes.Decimal:
            case DataTypes.Currency:
            case DataTypes.WholeDuration: {
                return new TextProperty(binding, this._options);
            }
            default: {
                return new TextProperty(binding, this._options);
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
                        const bindingName = Object.entries(this._options.bindings).find(([name, binding]) => !binding.isStatic)?.[0]
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
                Callback: (value: any) => {
                    let binding = this._options.bindings[property.name];
                    if(!binding) {
                        const foundBindingName = Object.entries(this._options.bindings).find(([name, binding]) => !binding.isStatic)?.[0];
                        if(!foundBindingName) {
                            throw new Error('Missing binding!');
                        }
                        binding = this._options.bindings[foundBindingName];
                    }
                    binding.onNotifyOutputChanged?.(value)
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
        //context.mode = props.context.mode;
        //context.mode.isControlDisabled = this._options.callbacks?.onIsControlDisabled?.() ?? false;
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
}