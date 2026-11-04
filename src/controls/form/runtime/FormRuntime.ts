import { EventEmitter, IEventEmitter, IField, IFieldValidationResult, IRecord, IRecordSaveOperationResult, Localization } from "@talxis/client-libraries";
import { RequiredLevelEnum } from "@talxis/client-metadata";
import { ErrorHelper, HookRegistry } from "@core";
import { IFormAfterSaveParams, IFormEventHandlers, IValidation } from "../interfaces";

export interface IFormRuntimeParameters {
    record: IRecord;
    /** Saves the record after each change committed to it. */
    autoSave?: boolean;
}

/** A save about to happen; a blocker sets `isBlocked` to stop it. */
export interface IFormSaveRequest {
    isBlocked: boolean;
}

/** Runs before every save, and may stop it. */
export type FormSaveBlocker = (request: IFormSaveRequest) => Promise<void> | void;

export interface IFormEvents extends IFormEventHandlers {
    onRefreshRequested: () => void;
    onDestroy: () => void;
}

export interface IFormRuntime {
    events: IEventEmitter<IFormEvents>;
    saveOperationPerformed: boolean;
    getRecordReference: () => ComponentFramework.EntityReference;
    getValidationSummary: () => IValidation[];
    getMetadata: () => { PrimaryIdAttribute: string; PrimaryNameAttribute: string };
    isDirty: () => boolean;
    isValid: () => boolean;
    refresh: () => void;

    /**
     * Returns the current data held by the form, including in-progress values
     * that may currently be invalid.
     */
    getData: () => { [key: string]: any };
    save: () => Promise<void>;
    /** Runs `blocker` before every save from now on; returns what takes it off again. */
    registerSaveBlocker: (blocker: FormSaveBlocker) => () => void;
    destroy: () => void;
    getRecord(): IRecord;
    getFields: () => IField[];
    getField: (fieldName: string) => IField;
    setFieldRequiredLevel: (fieldName: string, requiredLevel: RequiredLevelEnum) => void;
    setFieldValid: (fieldName: string, validation: IFieldValidationResult) => void;
    /** The form's own required level for the field when set, otherwise the record's. */
    getFieldRequiredLevel: (fieldName: string) => Xrm.Attributes.RequirementLevel;
    /** The form's own rules for the field first, then the record's. */
    isFieldValid: (fieldName: string) => IFieldValidationResult;
}

const VALID: IFieldValidationResult = { error: false, errorMessage: '' };

const isEmpty = (value: unknown) => value === undefined || value === null || value === '';

const getRequiredMessage = () => Localization.GetString('utils/dataset/data-providers/Record/Field/Validation/ColumnRequired');

export class FormRuntime implements IFormRuntime {
    public readonly events: EventEmitter<IFormEvents> = new EventEmitter<IFormEvents>();
    private _record: IRecord;
    private _saveOperationPerformed: boolean = false;
    private _validationSummary: IValidation[] = [];
    private _validationExpressions: Map<string, () => IFieldValidationResult> = new Map();
    private _requiredLevelExpressions: Map<string, () => Xrm.Attributes.RequirementLevel> = new Map();
    private _isDirty: boolean = false;
    private _saveBlockers = new HookRegistry<FormSaveBlocker>();
    private _isAutoSaveEnabled: boolean;
    private _isSaving = false;
    private _isAutoSaveScheduled = false;
    //a change committed while a save runs is saved once that save ends
    private _isAutoSavePending = false;

    constructor(params: IFormRuntimeParameters) {
        this._record = params.record;
        this._isAutoSaveEnabled = !!params.autoSave;
        this._isDirty = this.isDirty();
        this._registerEventHandlers();
    }

    public get saveOperationPerformed(): boolean {
        return this._saveOperationPerformed;
    }

    public getRecord(): IRecord {
        return this._record;
    }

    public getField(fieldName: string): IField {
        return this._record.getField(fieldName);
    }

    public getFields(): IField[] {
        return this._record.getColumns().map(column => this._record.getField(column.name));
    }

    public getMetadata() {
        return this._record.getDataProvider().getMetadata() as any;
    }

    public getRecordReference(): ComponentFramework.EntityReference {
        return this._record.getNamedReference();
    }

    //kept off the record until expressions are hooks: see Dev › Provider rework, section 8
    public setFieldRequiredLevel(fieldName: string, requiredLevel: RequiredLevelEnum): void {
        this._requiredLevelExpressions.set(fieldName, () => FormRuntime.getXrmRequirementLevelFromEnum(requiredLevel));
    }

    public setFieldValid(fieldName: string, validation: IFieldValidationResult): void {
        this._validationExpressions.set(fieldName, () => validation);
    }

    public getFieldRequiredLevel(fieldName: string): Xrm.Attributes.RequirementLevel {
        return this._requiredLevelExpressions.get(fieldName)?.() ?? this.getField(fieldName).getRequiredLevel();
    }

    public isFieldValid(fieldName: string): IFieldValidationResult {
        const field = this.getField(fieldName);
        const ownResult = this._validationExpressions.get(fieldName)?.();
        if (ownResult?.error) {
            return ownResult;
        }
        const ownRequiredLevel = this._requiredLevelExpressions.get(fieldName)?.();
        if (ownRequiredLevel === undefined) {
            return field.isValid();
        }
        const isValueEmpty = isEmpty(field.getValue());
        if (isValueEmpty && ownRequiredLevel === 'required') {
            return { error: true, errorMessage: getRequiredMessage() };
        }
        const recordResult = field.isValid();
        return isValueEmpty && recordResult.errorMessage === getRequiredMessage() ? VALID : recordResult;
    }

    public destroy(): void {
        this.events.dispatchEvent('onDestroy');
        this.events.clearEventListeners();
        this._record.removeEventListener('onFieldValueChanged', this._handleFieldValueChanged);
    }

    public isDirty(): boolean {
        return this._record.isDirty();
    }

    public isValid(): boolean {
        return this.getFields().every(field => !this.isFieldValid(field.getColumn().name).error);
    }

    public getData(): { [key: string]: any } {
        return this._record.toRawData();
    }

    public refresh() {
        this.events.dispatchEvent('onRefreshRequested');
    }

    public getValidationSummary(): IValidation[] {
        return this._validationSummary;
    }

    public registerSaveBlocker(blocker: FormSaveBlocker): () => void {
        return this._saveBlockers.register(blocker);
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

    private async _save(): Promise<void> {
        return ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                this._saveOperationPerformed = true;
                this.events.dispatchEvent('onBeforeSave');

                this._createValidationSummaryFromFields(this.getFields());

                if (this._validationSummary.length > 0) {
                    this._dispatchAfterSave({ success: false });
                    return;
                }

                const request: IFormSaveRequest = { isBlocked: false };
                await this._saveBlockers.applyAsync(request);
                if (request.isBlocked) {
                    this._dispatchAfterSave({ success: false });
                    return;
                }

                const saveResult = await this._record.save();

                if (!saveResult.success) {
                    this._createValidationSummaryFromSaveResult(saveResult);
                    this._dispatchAfterSave({ success: false });
                    return;
                }

                this._createValidationSummaryFromFields(this.getFields());
                this._dispatchDirtyStateIfChanged();
                this._dispatchAfterSave({ success: true });
            },
            onError: (error, message) => {
                this.events.dispatchEvent('onError', error, message);
            }
        });
    }

    public static getRequiredLevelEnumFromXrm(requiredLevel?: Xrm.Attributes.RequirementLevel): RequiredLevelEnum {
        switch (requiredLevel) {
            case 'required':
                return RequiredLevelEnum.ApplicationRequired;
            case 'recommended':
                return RequiredLevelEnum.Recommended;
            default:
                return RequiredLevelEnum.None;
        }
    }

    public static getXrmRequirementLevelFromEnum(requiredLevel?: RequiredLevelEnum): Xrm.Attributes.RequirementLevel {
        switch (requiredLevel) {
            case RequiredLevelEnum.SystemRequired:
            case RequiredLevelEnum.ApplicationRequired:
                return 'required';
            case RequiredLevelEnum.Recommended:
                return 'recommended';
            default:
                return 'none';
        }
    }

    private _registerEventHandlers(): void {
        this._record.addEventListener('onFieldValueChanged', this._handleFieldValueChanged);
    }

    private _handleFieldValueChanged = (fieldName: string, newValue: any): void => {
        this.events.dispatchEvent('onFieldValueChanged', fieldName, newValue);
        this._dispatchDirtyStateIfChanged();
        if (this._isAutoSaveEnabled) {
            this._scheduleAutoSave();
        }
    }

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
        await this.save();
        if (this._isAutoSavePending) {
            this._isAutoSavePending = false;
            if (this.isDirty()) {
                await this._autoSave();
            }
        }
    }

    private _dispatchAfterSave(params: IFormAfterSaveParams): void {
        this.events.dispatchEvent('onAfterSave', params);
    }

    private _dispatchDirtyStateIfChanged(): void {
        const isDirty = this.isDirty();
        if(this._isDirty === isDirty) return;

        this._isDirty = isDirty;
        this.events.dispatchEvent('onDirtyStateChanged', isDirty);
    }

    private _createValidationSummaryFromFields(fields: IField[]): void {
        this._validationSummary = fields
            .map(field => {
                return {
                    fieldName: field.getColumn().name,
                    ...this.isFieldValid(field.getColumn().name)
                };
            })
            .filter(validation => !!validation.error);
        this.events.dispatchEvent('onValidationSummaryChanged', this._validationSummary);
    }

    private _createValidationSummaryFromSaveResult(saveResult: IRecordSaveOperationResult): void {
        this._validationSummary = (saveResult.errors ?? []).map(error => {
            const errorWithFieldName = error as { fieldName?: string; message?: string };

            return {
                fieldName: errorWithFieldName.fieldName,
                error: true,
                errorMessage: error.message ?? '',
            };
        });
        this.events.dispatchEvent('onValidationSummaryChanged', this._validationSummary);
    }

}
