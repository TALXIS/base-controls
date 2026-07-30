import type { IXrmFormStrategy } from '../../components/xrm-form/XrmForm';
import type { XrmFormContext } from '../../xrm-context';
import { IFormConfig, XrmClientApiStrategyFactory } from '../../strategies/XrmClientApiStrategyFactory';

export interface IXrmFormAdapterInputs {
    Height?: ComponentFramework.PropertyTypes.StringProperty;
    ClientApiWebResourceName: ComponentFramework.PropertyTypes.StringProperty;
    ClientApiConfigFunctionName: ComponentFramework.PropertyTypes.StringProperty;
    ClientApiFormContextFunctionName?: ComponentFramework.PropertyTypes.StringProperty;
}

export interface IXrmFormAdapterRenderProps<IInputs extends IXrmFormAdapterInputs> {
    container: HTMLDivElement;
    context: ComponentFramework.Context<IInputs>;
    strategy: IXrmFormStrategy;
    strategyVersion: string;
    onFormReady: (formContext: XrmFormContext) => Promise<void>;
}

/**
 * Helper class that keeps Form PCF wrappers thin by owning the Xrm client-api
 * setup, strategy refresh flow, and host container layout.
 */
export class XrmFormAdapter<IInputs extends IXrmFormAdapterInputs> {
    private _container!: HTMLDivElement;
    private _context!: ComponentFramework.Context<IInputs>;
    private _strategy?: IXrmFormStrategy;
    private _strategyVersion: string = crypto.randomUUID();

    public init(context: ComponentFramework.Context<IInputs>, container: HTMLDivElement): void {
        this._context = context;
        this._container = container;

        this._applyContainerLayout();
        this._executeClientApiConfigScript();
    }

    public updateView(
        context: ComponentFramework.Context<IInputs>,
        onRenderForm: (props: IXrmFormAdapterRenderProps<IInputs>) => void,
        onRenderLoading?: (container: HTMLDivElement) => void,
    ): void {
        this._context = context;

        if (!this._strategy) {
            onRenderLoading?.(this._container);
            return;
        }

        onRenderForm({
            container: this._container,
            context: this._context,
            strategy: this._strategy,
            strategyVersion: this._strategyVersion,
            onFormReady: (formContext) => this._executeClientApiFormContextScript(formContext),
        });
    }

    public destroy(): void {
    }

    private _setStrategy(config: IFormConfig): void {
        this._strategy = XrmClientApiStrategyFactory.create(config);
        this._strategyVersion = crypto.randomUUID();
        this._context.factory.requestRender();
    }

    private async _executeClientApiConfigScript(): Promise<void> {
        //@ts-ignore - typings
        await Xrm.Utility.executeFunction(
            this._getRequiredParameterValue(this._context.parameters.ClientApiWebResourceName?.raw, 'ClientApiWebResourceName'),
            this._getRequiredParameterValue(this._context.parameters.ClientApiConfigFunctionName?.raw, 'ClientApiConfigFunctionName'),
            [{
                setConfig: (config: IFormConfig) => this._setStrategy(config),
            }],
        );
    }

    private async _executeClientApiFormContextScript(formContext: XrmFormContext): Promise<void> {
        const clientApiFormContextFunctionName = this._context.parameters.ClientApiFormContextFunctionName?.raw;
        if (!clientApiFormContextFunctionName) {
            return;
        }

        //@ts-ignore - typings
        await Xrm.Utility.executeFunction(
            this._getRequiredParameterValue(this._context.parameters.ClientApiWebResourceName?.raw, 'ClientApiWebResourceName'),
            clientApiFormContextFunctionName,
            [{
                formContext,
            }],
        );
    }

    private _applyContainerLayout(): void {
        const height = this._context.parameters.Height?.raw?.trim();

        this._container.style.boxSizing = 'border-box';
        this._container.style.padding = height === '100%' ? '16px' : '';
    }

    private _getRequiredParameterValue(value: string | null | undefined, parameterName: string): string {
        if (!value) {
            throw new Error(`The "${parameterName}" parameter is required for the Form Xrm adapter.`);
        }

        return value;
    }
}
