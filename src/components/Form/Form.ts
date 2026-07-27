import { EventEmitter, IEventEmitter, IField, IFieldValidationResult, IMemoryProvider, IRecord, IRecordSaveOperationResult, MemoryDataProvider } from "@talxis/client-libraries";
import { RequiredLevelEnum } from "@talxis/client-metadata";
import { IFormStrategy, IOnLoadResult } from "./stragegies/interfaces";
import { ErrorHelper } from "../../utils";

export interface IFormParams {
    deps: IOnLoadResult;
    strategy: IFormStrategy;
}

export interface IFormEvents {
    onFieldValueChanged: (fieldName: string, newValue: any) => void;
    onError: (error: any, message: string) => void;
    onBeforeSave: () => void;
    onAfterSave: (result: IRecordSaveOperationResult, updatedData?: { [key: string]: any }) => void;
}

export interface IForm {
    events: IEventEmitter<IFormEvents>;
    saveOperationPerformed: boolean;
    getRecordReference: () => ComponentFramework.EntityReference;
    getValidationSummary: () => IValidation[];
    getMetadata: () => { PrimaryIdAttribute: string; PrimaryNameAttribute: string };
    isDirty: () => boolean;
    isValid: () => boolean;
    getData: () => { [key: string]: any };
    save: () => Promise<void>;
    destroy: () => void;
    getRecord(): IRecord;
    getFields: () => IField[];
    getField: (fieldName: string) => IField;
    setFieldRequiredLevel: (fieldName: string, requiredLevel: RequiredLevelEnum) => void;
    setFieldValid: (fieldName: string, validation: IFieldValidationResult) => void;
}

export interface IValidation extends IFieldValidationResult {
    fieldName: string;
}


export class Form implements IForm {
    public readonly events: IEventEmitter<IFormEvents> = new EventEmitter<IFormEvents>();
    private _record: IRecord;
    private _dataProvider: IMemoryProvider;
    private _strategy: IFormStrategy;
    private _saveOperationPerformed: boolean = false;
    private _validationSummary: IValidation[] = [];
    private _validationExpressions: Map<string, () => IFieldValidationResult> = new Map();
    private _requiredLevelExpressions: Map<string, () => Xrm.Attributes.RequirementLevel> = new Map();
    private _disabledExpressions: Map<string, () => boolean> = new Map();

    constructor(params: IFormParams) {
        this._strategy = params.strategy;
        this._dataProvider = this._createDataProvider(params.deps);
        this._record = this._dataProvider.getRecords()[0];
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
        return this._dataProvider.getMetadata() as any;
    }

    public getRecordReference(): ComponentFramework.EntityReference {
        return this._record.getNamedReference();
    }

    public setFieldRequiredLevel(fieldName: string, requiredLevel: RequiredLevelEnum): void {
        this._requiredLevelExpressions.set(fieldName, () => {
            return Form.getXrmRequirementLevelFromEnum(requiredLevel);
        });
        this._record.expressions.setRequiredLevelExpression(fieldName, () => this._requiredLevelExpressions.get(fieldName)!());
    }

    public setFieldValid(fieldName: string, validation: IFieldValidationResult): void {
        this._validationExpressions.set(fieldName, () => validation);
        this._record.expressions.setValidationExpression(fieldName, () => this._validationExpressions.get(fieldName)!());
    }

    public destroy(): void {
        this._validationExpressions.clear();
        this._requiredLevelExpressions.clear();
        this._disabledExpressions.clear();
        this._dataProvider.destroy();
    }

    public isDirty(): boolean {
        return this._dataProvider.isDirty();
    }

    public isValid(): boolean {
        return this._dataProvider.isValid();
    }

    public getData(): { [key: string]: any } {
        return this._record.getRawData();
    }

    public getValidationSummary(): IValidation[] {
        return this._validationSummary;
    }

    public async save(): Promise<void> {
        ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                this.events.dispatchEvent('onBeforeSave');
                const dirtyFields = this._record.getFields().filter(f => f.isDirty());
                const result = await this._record.save();
                if (!result.success) {
                    this.events.dispatchEvent('onAfterSave', result);
                    return;
                }

                this._registerExistingExpressions();
                const changedData = this._getChangedData(dirtyFields);  
                const saveResult = await this._strategy.onSave({ data: changedData });
                this.events.dispatchEvent('onAfterSave', saveResult, changedData);
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

    private _createDataProvider(deps: IOnLoadResult): IMemoryProvider {
        const { data, columns, metadata } = deps;

        const provider = new MemoryDataProvider({
            dataSource: [data],
            metadata: metadata
        });

        provider.setColumns(columns);
        provider.refreshSync();
        return provider;
    }

    private _registerEventHandlers(): void {
        this._record.addEventListener('onBeforeSaved', () => {
            this._saveOperationPerformed = true;
            this.events.dispatchEvent('onBeforeSave');
        })
        this._record.addEventListener('onAfterSaved', (result) => this._createValidationSummary(result));
        this._record.addEventListener('onFieldValueChanged', (fieldName, newValue) => this.events.dispatchEvent('onFieldValueChanged', fieldName, newValue));
    }

    private _createValidationSummary(saveOperationResult: IRecordSaveOperationResult) {
        this._validationSummary = saveOperationResult.errors?.map(error => {
            return {
                fieldName: error.fieldName!,
                error: true,
                errorMessage: error.message
            }
        }) ?? [];
    }

    private _registerExistingExpressions(): void {
        this._requiredLevelExpressions.forEach((expression, fieldName) => {
            this._record.expressions.setRequiredLevelExpression(fieldName, expression);
        });
        this._validationExpressions.forEach((expression, fieldName) => {
            this._record.expressions.setValidationExpression(fieldName, expression);
        });
    }

    private _getChangedData(dirtyFields: IField[]): { [key: string]: any } {
        const rawData = this._record.getRawData();

        return Object.fromEntries(
            dirtyFields.map(field => [field.getColumn().name, rawData[field.getColumn().name]])
        );
    }
}
