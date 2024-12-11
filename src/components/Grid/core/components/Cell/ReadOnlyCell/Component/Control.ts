import { ControlHandler } from "./ControlHandler";

interface IEntityMetadata {
    entityName?: string;
    linking?: ComponentFramework.PropertyHelper.DataSetApi.LinkEntityExposedExpression[];
}

export interface IControlOptions {
    controlHandler: ControlHandler,
    onNotifyOuputChanged: (value: any) => void;
    entityMetadata?: IEntityMetadata;
}

export abstract class Control {
    protected _controlHandler: ControlHandler;
    protected _onNotifyOutputChanged: (value: any) => void;
    protected _entityMetadata?: IEntityMetadata;
    private _controlId: string;
    private _initialized: boolean = false;

    constructor(options: IControlOptions) {
        this._controlHandler = options.controlHandler;
        this._onNotifyOutputChanged = options.onNotifyOuputChanged;
        this._entityMetadata = options.entityMetadata;
        this._controlId = crypto.randomUUID();
    }

    public abstract getProps(): any;
    public abstract init(): Promise<boolean>

    public render() {
        const properties: any = {
            controlstates: {
                // This is the only implemented controlState parameter
                isControlDisabled: false,
            },
            parameters: this._getParameters()
        };
        if(!this._initialized) {
            const component = (this._controlHandler.getParentContext() as any).factory.createComponent('talxis_TALXIS.PCF.ColorPicker', this._controlId, properties);
            (this._controlHandler.getParentContext() as any).factory.bindDOMElement(component, this._controlHandler.getContainerElement());
        }
        this._initialized = true;
    }

    private _getParameters() {
        const parameters = this._controlHandler.getColumn().parameters;
        let result: {[name: string]: any} = {};
        Object.entries(parameters).map(([name, parameter]) => {
            result[name] = {
                Static: parameter.static,
                Primary: false,
                //need to fetch manifest for this to work properly
                Type: parameter.static ? parameter.type : this._controlHandler.getColumn().dataType,
                Value: parameter.static ? parameter.value : this._controlHandler.getBindingValue(),
                Usage: parameter.static ? 0 : 3,
                Callback: (value: any) => {

                }
            }
        })
    }
}