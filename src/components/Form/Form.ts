import { IColumn, IField, IFieldValidationResult, IMemoryProvider, IRecord, MemoryDataProvider } from "@talxis/client-libraries";
import { RequiredLevelEnum } from "@talxis/client-metadata";

export interface IFormParams {
    data: { [key: string]: any }[];
    columns: IColumn[];
    metadata: {
        PrimaryIdAttribute: string;
        PrimaryNameAttribute: string;
    }
}

export interface IForm {
    getRecord(): IRecord;
    getField: (fieldName: string) => IField;
    setFieldDisabled: (fieldName: string, disabled: boolean) => void;
    setFieldRequiredLevel: (fieldName: string, requiredLevel: RequiredLevelEnum) => void;
    setFieldValidationResult: (fieldName: string, validationResult: IFieldValidationResult) => void;
}


export class Form implements IForm {
    private _record: IRecord;
    private _dataProvider: IMemoryProvider;

    constructor(params: IFormParams) {
        this._dataProvider = this._createDataProvider(params);
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

    public setFieldValidationResult(fieldName: string, validationResult: IFieldValidationResult): void {
        this._record.expressions.setValidationExpression(fieldName, () => validationResult);
    }

    public static getRequiredLevelEnumFromString(requiredLevel: string): RequiredLevelEnum {
        switch (requiredLevel) {
            case 'none':
                return RequiredLevelEnum.None;
            case 'required':
                return RequiredLevelEnum.ApplicationRequired;
            case 'recommended':
                return RequiredLevelEnum.Recommended;
            default:
                return RequiredLevelEnum.None;
        }
    }

    public static getRequiredLevelStringFromEnum(requiredLevel: RequiredLevelEnum): string {
        switch (requiredLevel) {
            case RequiredLevelEnum.None:
                return 'none';
            case RequiredLevelEnum.ApplicationRequired:
                return 'required';
            case RequiredLevelEnum.Recommended:
                return 'recommended';
            default:
                return 'none';
        }
    }

    public static getXrmRequirementLevelFromEnum(requiredLevel: RequiredLevelEnum): Xrm.Attributes.RequirementLevel {
        switch (requiredLevel) {
            case RequiredLevelEnum.None:
                return 'none';
            case RequiredLevelEnum.ApplicationRequired:
                return 'required';
            case RequiredLevelEnum.Recommended:
                return 'recommended';
            default:
                return 'none';
        }
    }

    private _createDataProvider(params: IFormParams): IMemoryProvider {
        const { data, columns, metadata } = params;

        const provider = new MemoryDataProvider({
            dataSource: data,
            metadata: metadata
        });

        provider.setColumns(columns);
        provider.refreshSync();
        return provider;
    }
}
