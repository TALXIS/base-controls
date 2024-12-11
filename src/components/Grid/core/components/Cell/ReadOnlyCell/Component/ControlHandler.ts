import { DataType, DataTypes, IFieldValidationResult } from "@talxis/client-libraries";
import { Control, IControlOptions } from "./Control";
import { TextFieldControl } from "./TextFieldControl";
import { OptionSetControl } from "./OptionSetControl";



interface IControlHandlerOptions {
    /**
     * Name of the control to be rendered.
     */
    controlName: string;
    /**
     * Column associated with given control
     */
    column: {
        name: string;
        dataType: DataType;
        parameters: {
            [name: string]: {
                static: boolean;
                type: DataType;
                /**
                 * Value can be set only on static parameter
                 */
                value?: boolean;
            }
        }
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
     * Callback for getting the current binding value.
     */
    valueGetter: () => any;

    /**
     * Callback for getting the current formatted binding value.
     */
    formattedValueGetter: () => string | null;

    callbacks: {
        onGetValidationResult: () => IFieldValidationResult;
        onNotifyOutputChanged: (value: any) => void;
        onInit: () => void;
    },
    overrides?: {
        //TODO: try to figure out typings
        /**
         * Allows you to override generated control props.
         */
        onOverrideControlProps?: (props: Control['getProps']) => Control['getProps'];
        /**
         * Allows you to use custom render method for control instead of nested PCF.
         */
        onOverrideRender?: (containerElement: HTMLDivElement, props: ReturnType<Control['getProps']>) => void;
    },
    /**
     * Provide if you want to use entity metadata for building of the parameters. Example is OptionSet that can use this information to fetch options from metadata.
     */
    entityMetadata?: {
        entityName?: string;
        linking?: ComponentFramework.PropertyHelper.DataSetApi.LinkEntityExposedExpression[];
    }
}

export class ControlHandler {
    private _parentPcfContext: ComponentFramework.Context<any, any>;
    private _dataType: DataType;
    private _options: IControlHandlerOptions;
    private _control: Control;
    private _initialized: boolean = false;
    private _containerElement: HTMLDivElement;

    constructor(options: IControlHandlerOptions) {
        this._parentPcfContext = options.parentPcfContext;
        this._dataType = options.column.dataType;
        this._containerElement = options.containerElement;
        this._options = options;
        this._control = this._getControlInstance(this._dataType);
    }
    public async init() {
        this._initialized = await this._control.init();
        this._options.callbacks.onInit();
    }
    public getProps() {
        if (!this._initialized) {
            throw new Error('');
        }
        return this._control.getProps();
    }
    /**
     * Gets the PCF Context of parent control.
     */
    public getParentContext(): ComponentFramework.Context<any, any> {
        return this._parentPcfContext;
    }
    /**
     * Name of the control.
     *
     */
    public getControlName() {
        return this._options.controlName;
    }
    /**
     * Gets the control binding value.
     */
    public getBindingValue(): any {
        return this._options.valueGetter();
    }

    public getFormattedBindingValue() {
        return this._options.formattedValueGetter();
    }
    public getColumn() {
        return this._options.column;
    }
    /**
     * Returns validation result for given field value;
     */
    public getValidationResult() {
        return this._options.callbacks.onGetValidationResult();
    }

    public getContainerElement() {
        return this._options.containerElement;
    }

    public render() {
        if (this._options.overrides?.onOverrideRender) {
            return this._options.overrides.onOverrideRender(this.getContainerElement(), this.getProps())
        }
        return this._control.render();
    }

    private _getControlInstance(dataType: DataType) {
        const options: IControlOptions = {
            controlHandler: this,
            onNotifyOuputChanged: this._options.callbacks.onNotifyOutputChanged,
            entityMetadata: this._options.entityMetadata
        }
        switch (dataType) {
            case DataTypes.LookupSimple:
            case DataTypes.LookupOwner:
            case DataTypes.LookupCustomer: {
                return new TextFieldControl(options)
            }

            case DataTypes.TwoOptions:
            case DataTypes.OptionSet:
            case DataTypes.MultiSelectOptionSet: {
                return new OptionSetControl(options)
            }
            case DataTypes.DateAndTimeDateAndTime:
            case DataTypes.DateAndTimeDateOnly: {
                return new TextFieldControl(options)
            }
            case DataTypes.WholeNone:
            case DataTypes.Decimal:
            case DataTypes.Currency:
            case DataTypes.WholeDuration: {
                return new TextFieldControl(options)
            }
            default: {
                return new TextFieldControl(options)
            }
        }
    }
}