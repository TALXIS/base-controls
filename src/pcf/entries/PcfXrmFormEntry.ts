import { IColumn, IRecord, IRecordSaveOperationResult } from '@talxis/client-libraries';
import type { IXrmFormContext, IXrmFormLoadResult } from '@controls/form/modules/xrm-form/interfaces';
import { createMemoryRecord } from '@controls/form/runtime/createMemoryRecord';
import { FORM_LABELS } from '@controls/form/labels';
import { translateLabels, type Labels } from "@labels";
import { NOTIFICATION_MESSAGE_BAR_LABELS } from "@ui";
import { createThemeBuilder, ITheme } from '@theme';

export interface IPcfXrmFormEntryInputs {
    Height?: ComponentFramework.PropertyTypes.StringProperty;
    ClientApiWebResourceName: ComponentFramework.PropertyTypes.StringProperty;
    ClientApiConfigFunctionName: ComponentFramework.PropertyTypes.StringProperty;
    ClientApiFormContextFunctionName?: ComponentFramework.PropertyTypes.StringProperty;
}

export type ISaveResponse = { success: true } | { success: false, error: string };

/** What the client API config script hands `setConfig`. */
export interface IFormConfig {
    formXml?: string;
    entityName?: string;
    entityId?: string;
    formId?: string;
    columns?: IColumn[];
    data?: { [key: string]: any };
    metadata?: {
        PrimaryIdAttribute: string;
        PrimaryNameAttribute: string;
    };
    onSave?: (parameters: { updatedData: { [key: string]: any }, recordId: string }) => Promise<ISaveResponse>;
}

export interface IPcfXrmFormEntryRenderProps<IInputs extends IPcfXrmFormEntryInputs> {
    container: HTMLDivElement;
    context: ComponentFramework.Context<IInputs>;
    onLoad: () => Promise<IXrmFormLoadResult>;
    /** Changes each time the config is set again; key the form with it. */
    loadVersion: string;
    labels: Labels;
    theme: ITheme;
    onFormReady: (formContext: IXrmFormContext) => Promise<void>;
}

/**
 * Helper class that keeps Form PCF wrappers thin by owning the Xrm client-api
 * setup, record loading, and host container layout.
 */
export class PcfXrmFormEntry<IInputs extends IPcfXrmFormEntryInputs> {
    private _container!: HTMLDivElement;
    private _context!: ComponentFramework.Context<IInputs>;
    private _config?: IFormConfig;
    private _loadVersion: string = crypto.randomUUID();

    public init(context: ComponentFramework.Context<IInputs>, container: HTMLDivElement): void {
        this._context = context;
        this._container = container;

        this._applyContainerLayout();
        this._executeClientApiConfigScript();
    }

    public updateView(
        context: ComponentFramework.Context<IInputs>,
        onRenderForm: (props: IPcfXrmFormEntryRenderProps<IInputs>) => void,
        onRenderLoading?: (container: HTMLDivElement) => void,
    ): void {
        this._context = context;

        if (!this._config) {
            onRenderLoading?.(this._container);
            return;
        }

        onRenderForm({
            container: this._container,
            context: this._context,
            onLoad: this._onLoad,
            loadVersion: this._loadVersion,
            labels: this._getLabels(),
            theme: this._getTheme(),
            onFormReady: (formContext) => this._executeClientApiFormContextScript(formContext),
        });
    }

    public destroy(): void {
    }

    private _setConfig(config: IFormConfig): void {
        if (!config.formXml || !config.metadata || !config.columns) {
            throw new Error("Form control requires formXml, metadata and columns to be provided in the config.");
        }
        this._config = config;
        this._loadVersion = crypto.randomUUID();
        this._context.factory.requestRender();
    }

    private _onLoad = async (): Promise<IXrmFormLoadResult> => {
        const { columns, data, metadata, formXml, onSave } = this._config!;
        const record = createMemoryRecord({
            columns: columns!,
            data: data ?? {},
            metadata: metadata!,
            save: onSave && (savedRecord => this._save(onSave, savedRecord)),
        });
        return { record, formXml: formXml! };
    };

    private async _save(onSave: NonNullable<IFormConfig['onSave']>, record: IRecord): Promise<IRecordSaveOperationResult> {
        const recordId = record.getRecordId();
        const rawData = record.toRawData();
        const fields = record.getFields().filter(field => field.isDirty()).map(field => field.getColumn().name);
        const result = await onSave({ updatedData: Object.fromEntries(fields.map(name => [name, rawData[name]])), recordId });
        if (result.success) {
            return { recordId, success: true, fields };
        }
        return { recordId, success: false, fields, errors: [{ message: result.error }] };
    }

    private async _executeClientApiConfigScript(): Promise<void> {
        //@ts-ignore - typings
        await Xrm.Utility.executeFunction(
            this._getRequiredParameterValue(this._context.parameters.ClientApiWebResourceName?.raw, 'ClientApiWebResourceName'),
            this._getRequiredParameterValue(this._context.parameters.ClientApiConfigFunctionName?.raw, 'ClientApiConfigFunctionName'),
            [{
                setConfig: (config: IFormConfig) => this._setConfig(config),
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

    private _getLabels(): Labels {
        return {
            ...translateLabels(FORM_LABELS, {
                'form.save': this._context.resources.getString('save'),
                'form.saving': this._context.resources.getString('saving'),
                'form.saved': this._context.resources.getString('saved'),
                'form.unsavedChanges': this._context.resources.getString('unsavedChanges'),
            }),
            ...translateLabels(NOTIFICATION_MESSAGE_BAR_LABELS, {
                'notificationMessageBar.groupedNotificationsSummary': this._context.resources.getString('groupedNotificationsSummary'),
            }),
        };
    }

    private _getTheme(): ITheme {
        return createThemeBuilder().getTheme();
    }

    private _getRequiredParameterValue(value: string | null | undefined, parameterName: string): string {
        if (!value) {
            throw new Error(`The "${parameterName}" parameter is required for the Form Xrm adapter.`);
        }

        return value;
    }
}
