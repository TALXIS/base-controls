import type { IXrmFormStrategy } from '../../interfaces';
import type { IXrmFormContext } from '../../interfaces';
import { IFormConfig, XrmClientApiStrategyFactory } from '../../strategies/XrmClientApiStrategyFactory';
import type { IFormLabels } from '@components/Form/labels';
import { ControlTheme } from '@utils/theme';
import type { ITheme } from '@legacy';

export interface IPcfXrmFormAdapterInputs {
    Height?: ComponentFramework.PropertyTypes.StringProperty;
    ClientApiWebResourceName: ComponentFramework.PropertyTypes.StringProperty;
    ClientApiConfigFunctionName: ComponentFramework.PropertyTypes.StringProperty;
    ClientApiFormContextFunctionName?: ComponentFramework.PropertyTypes.StringProperty;
}

export interface IPcfXrmFormAdapterRenderProps<IInputs extends IPcfXrmFormAdapterInputs> {
    container: HTMLDivElement;
    context: ComponentFramework.Context<IInputs>;
    strategy: IXrmFormStrategy;
    strategyVersion: string;
    labels: Partial<IFormLabels>;
    theme: ITheme;
    onFormReady: (formContext: IXrmFormContext) => Promise<void>;
}

/**
 * Helper class that keeps Form PCF wrappers thin by owning the Xrm client-api
 * setup, strategy refresh flow, and host container layout.
 */
export class PcfXrmFormAdapter<IInputs extends IPcfXrmFormAdapterInputs> {
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
        onRenderForm: (props: IPcfXrmFormAdapterRenderProps<IInputs>) => void,
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
            labels: this._getLabels(),
            theme: this._getTheme(),
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

    private async _executeClientApiFormContextScript(formContext: IXrmFormContext): Promise<void> {
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

    private _getLabels(): Partial<IFormLabels> {
        return {
            save: this._context.resources.getString('save'),
            saving: this._context.resources.getString('saving'),
            saved: this._context.resources.getString('saved'),
            unsavedChanges: this._context.resources.getString('unsavedChanges'),
            groupedNotificationsSummary: this._context.resources.getString('groupedNotificationsSummary'),
        };
    }

    private _getTheme(): ITheme {
        return ControlTheme.GetV8ThemeFromFluentDesignLanguage(this._context.fluentDesignLanguage);
    }

    private _getRequiredParameterValue(value: string | null | undefined, parameterName: string): string {
        if (!value) {
            throw new Error(`The "${parameterName}" parameter is required for the Form Xrm adapter.`);
        }

        return value;
    }
}
