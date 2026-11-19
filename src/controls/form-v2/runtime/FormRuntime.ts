import { EventEmitter, IField, IFieldValidationResult, IRecord, IRecordSaveOperationResult, Localization } from "@talxis/client-libraries";
import { RequiredLevelEnum } from "@talxis/client-metadata";
import { ErrorHelper, HookRegistry, Runtime } from "@core";
import type { IFormV2Props } from "../FormV2";
import { FormTabs, IFormTabs } from "./parts/tabs/FormTabs";
import { FormSections, IFormSections } from "./parts/sections/FormSections";
import { FormControls, IFormControls } from "./parts/controls/FormControls";
import { FormSaveBlocker, IFormEvents, IForm, IFormModule, IFormModuleMap, IFormPartMap, IFormSaveRequest, IFormValidation } from "./interfaces";

export interface IFormRuntimeParameters {
    getProps: () => IFormV2Props;
}

const VALID: IFieldValidationResult = { error: false, errorMessage: '' };

const isEmpty = (value: unknown) => value === undefined || value === null || value === '';

const getRequiredMessage = () => Localization.GetString('utils/dataset/data-providers/Record/Field/Validation/ColumnRequired');

const toRequiredLevel = (requiredLevel: Xrm.Attributes.RequirementLevel): RequiredLevelEnum => {
    switch (requiredLevel) {
        case 'required':
            return RequiredLevelEnum.ApplicationRequired;
        case 'recommended':
            return RequiredLevelEnum.Recommended;
        default:
            return RequiredLevelEnum.None;
    }
};

export class FormRuntime extends Runtime<IFormPartMap, IFormModuleMap, IForm> implements IForm {
    public readonly events = new EventEmitter<IFormEvents>();
    private _getProps: () => IFormV2Props;
    private _record?: IRecord;
    private _tabs = new FormTabs();
    private _sections = new FormSections();
    private _controls = new FormControls();
    private _isSaveAttempted = false;
    private _isDirty = false;
    private _validationSummary: IFormValidation[] = [];
    private _requiredLevels = new Map<string, RequiredLevelEnum>();
    private _validations = new Map<string, IFieldValidationResult>();
    private _saveBlockers = new HookRegistry<FormSaveBlocker>();
    private _isSaving = false;
    private _isAutoSaveScheduled = false;
    //a change committed while a save runs is saved once that save ends
    private _isAutoSavePending = false;

    constructor(parameters: IFormRuntimeParameters) {
        super();
        this._getProps = parameters.getProps;
    }

    public get tabs(): IFormTabs {
        return this._tabs;
    }

    public get sections(): IFormSections {
        return this._sections;
    }

    public get controls(): IFormControls {
        return this._controls;
    }

    public getRecord(): IRecord {
        if (!this._record) {
            throw new Error('The record is there once onLoad has resolved.');
        }
        return this._record;
    }

    public getField(fieldName: string): IField {
        return this.getRecord().getField(fieldName);
    }

    public getFields(): IField[] {
        const record = this.getRecord();
        return record.getColumns().map(column => record.getField(column.name));
    }

    public getData(): { [key: string]: unknown } {
        return this.getRecord().toRawData();
    }

    public isDirty(): boolean {
        return this.getRecord().isDirty();
    }

    public isValid(): boolean {
        return this.getFields().every(field => !this.getFieldValidation(field.getColumn().name).error);
    }

    public isSaveAttempted(): boolean {
        return this._isSaveAttempted;
    }

    public getValidationSummary(): IFormValidation[] {
        return this._validationSummary;
    }

    public reload(): void {
        this.lifecycle.remount();
    }

    public addSaveBlocker(blocker: FormSaveBlocker): () => void {
        return this._saveBlockers.add(blocker);
    }

    public setFieldRequiredLevel(fieldName: string, requiredLevel: RequiredLevelEnum | null): void {
        if (requiredLevel === null) {
            this._requiredLevels.delete(fieldName);
            return;
        }
        this._requiredLevels.set(fieldName, requiredLevel);
    }

    public setFieldValidation(fieldName: string, validation: IFieldValidationResult | null): void {
        if (validation === null) {
            this._validations.delete(fieldName);
            return;
        }
        this._validations.set(fieldName, validation);
    }

    public getFieldRequiredLevel(fieldName: string): RequiredLevelEnum {
        return this._requiredLevels.get(fieldName) ?? toRequiredLevel(this.getField(fieldName).getRequiredLevel());
    }

    public getFieldValidation(fieldName: string): IFieldValidationResult {
        const field = this.getField(fieldName);
        const ownResult = this._validations.get(fieldName);
        if (ownResult?.error) {
            return ownResult;
        }
        const ownRequiredLevel = this._requiredLevels.get(fieldName);
        if (ownRequiredLevel === undefined) {
            return field.isValid();
        }
        const isValueEmpty = isEmpty(field.getValue());
        if (isValueEmpty && ownRequiredLevel !== RequiredLevelEnum.None && ownRequiredLevel !== RequiredLevelEnum.Recommended) {
            return { error: true, errorMessage: getRequiredMessage() };
        }
        const recordResult = field.isValid();
        return isValueEmpty && recordResult.errorMessage === getRequiredMessage() ? VALID : recordResult;
    }

    public async save(): Promise<void> {
        this._isSaving = true;
        try {
            await this._save();
        }
        finally {
            this._isSaving = false;
        }
    }

    protected getModules(): IFormModule[] {
        return this._getProps().modules ?? [];
    }

    protected async onInit(): Promise<void> {
        const { record } = await this._getProps().onLoad(this);
        if (this.lifecycle.isDestroyed()) {
            return;
        }
        this._record = record;
        this._isDirty = record.isDirty();
        record.addEventListener('onFieldValueChanged', this._onFieldValueChanged);
    }

    protected onDestroy(): void {
        this._record?.removeEventListener('onFieldValueChanged', this._onFieldValueChanged);
        this._controls.destroy();
        this._sections.destroy();
        this._tabs.destroy();
        this.events.clearEventListeners();
    }

    private async _save(): Promise<void> {
        return ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                this._isSaveAttempted = true;
                this.events.dispatchEvent('onBeforeSave');
                this._setValidationSummaryFromFields();
                if (this._validationSummary.length > 0) {
                    this.events.dispatchEvent('onAfterSave', false);
                    return;
                }
                const request: IFormSaveRequest = { isBlocked: false };
                await this._saveBlockers.applyAsync(request);
                if (request.isBlocked) {
                    this.events.dispatchEvent('onAfterSave', false);
                    return;
                }
                const result = await this.getRecord().save();
                if (!result.success) {
                    this._setValidationSummaryFromSaveResult(result);
                    this.events.dispatchEvent('onAfterSave', false);
                    return;
                }
                this._setValidationSummaryFromFields();
                this._dispatchDirtyStateIfChanged();
                this.events.dispatchEvent('onAfterSave', true);
            },
            onError: (error, message) => {
                this.events.dispatchEvent('onSaveFailed', message, error);
            }
        });
    }

    private _onFieldValueChanged = (fieldName: string, value: unknown): void => {
        this.events.dispatchEvent('onFieldValueChanged', fieldName, value);
        this._dispatchDirtyStateIfChanged();
        if (this._getProps().enableAutoSave) {
            this._scheduleAutoSave();
        }
    };

    //one save for every value set in the same task
    private _scheduleAutoSave(): void {
        if (this._isAutoSaveScheduled) {
            return;
        }
        this._isAutoSaveScheduled = true;
        queueMicrotask(() => {
            this._isAutoSaveScheduled = false;
            this._autoSave();
        });
    }

    private async _autoSave(): Promise<void> {
        if (this._isSaving) {
            this._isAutoSavePending = true;
            return;
        }
        //a failed save has already reached onSaveFailed
        try {
            await this.save();
        }
        catch {
            return;
        }
        if (this._isAutoSavePending) {
            this._isAutoSavePending = false;
            if (this.isDirty()) {
                await this._autoSave();
            }
        }
    }

    private _dispatchDirtyStateIfChanged(): void {
        const isDirty = this.isDirty();
        if (this._isDirty === isDirty) {
            return;
        }
        this._isDirty = isDirty;
        this.events.dispatchEvent('onDirtyStateChanged', isDirty);
    }

    private _setValidationSummaryFromFields(): void {
        this._validationSummary = this.getFields()
            .map(field => ({ fieldName: field.getColumn().name, ...this.getFieldValidation(field.getColumn().name) }))
            .filter(validation => validation.error);
        this.events.dispatchEvent('onValidationSummaryChanged', this._validationSummary);
    }

    private _setValidationSummaryFromSaveResult(result: IRecordSaveOperationResult): void {
        this._validationSummary = (result.errors ?? []).map(error => ({
            fieldName: (error as { fieldName?: string }).fieldName,
            error: true,
            errorMessage: error.message ?? '',
        }));
        this.events.dispatchEvent('onValidationSummaryChanged', this._validationSummary);
    }
}
