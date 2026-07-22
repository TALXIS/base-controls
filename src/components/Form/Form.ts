import { EventEmitter, IEventEmitter, IField, IFieldValidationResult, IMemoryProvider, IRecord, MemoryDataProvider } from "@talxis/client-libraries";
import { RequiredLevelEnum } from "@talxis/client-metadata";
import { IFormStrategy, IOnLoadResult } from "./stragegies/interfaces";
import { ErrorHelper } from "../../utils";

export interface IFormParams {
    deps: IOnLoadResult;
    strategy: IFormStrategy;
}

export interface IFormEvents {
    onError: (error: any, message: string) => void;
}

export interface IForm {
    events: IEventEmitter<IFormEvents>;
    isDirty: () => boolean;
    isValid: () => boolean;
    save: () => Promise<void>;
    getRecord(): IRecord;
    getField: (fieldName: string) => IField;
    setFieldDisabled: (fieldName: string, disabled: boolean) => void;
    setFieldRequiredLevel: (fieldName: string, requiredLevel: RequiredLevelEnum) => void;
    setFieldValid: (fieldName: string, validation: IFieldValidationResult) => void;
}


export class Form implements IForm {
    public events: IEventEmitter<IFormEvents> = new EventEmitter<IFormEvents>();
    private _record: IRecord;
    private _dataProvider: IMemoryProvider;
    private _strategy: IFormStrategy;

    constructor(params: IFormParams) {
        this._strategy = params.strategy;
        this._dataProvider = this._createDataProvider(params.deps);
        this._record = this._dataProvider.getRecords()[0];
    }

    public getRecord(): IRecord {
        return this._record;
    }

    public getField(fieldName: string): IField {
        return this._record.getField(fieldName);
    }

    public setFieldDisabled(fieldName: string, disabled: boolean): void {
        this._record.expressions.setDisabledExpression(fieldName, () => disabled);
    }

    public setFieldRequiredLevel(fieldName: string, requiredLevel: RequiredLevelEnum): void {
        this._record.expressions.setRequiredLevelExpression(fieldName, () => {
            return Form.getXrmRequirementLevelFromEnum(requiredLevel);
        });
    }

    public setFieldValid(fieldName: string, validation: IFieldValidationResult): void {
        this._record.expressions.setValidationExpression(fieldName, () => validation);
    }

    public isDirty(): boolean {
        return this._dataProvider.isDirty();
    }

    public isValid(): boolean {
        return this._dataProvider.isValid();
    }

    public async save(): Promise<void> {
        ErrorHelper.executeWithErrorHandling({
            operation: async () => {
                const dirtyFields = this._record.getFields().filter(f => f.isDirty());
                const result = await this._record.save();
                //validation failed
                if (result.success) return;
                const rawData = this._record.getRawData();
                const changedData = Object.fromEntries(
                    dirtyFields.map(f => [f.getColumn().name, rawData[f.getColumn().name]])
                );
                return this._strategy.onSave(changedData);
            },
            onError: (error, message) => this.events.dispatchEvent('onError', error, message)
        })
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
}
