import { Attribute, DatasetConstants, DataType, DataTypes, FieldValue, IColumn, IEventEmitter, IRawRecord, IRecord, IRecordSaveOperationResult, Sanitizer } from "@talxis/client-libraries";
import { DynamicEntityDefinition } from "@talxis/client-metadata";
import { Attribute as IAttribute } from '@talxis/client-metadata/dist/interfaces/entity/IEntityDefinition';
import { ICustomColumnsStrategy } from "./CustomColumnsDataProvider";

export const ATTRIBUTE_DEFINITION_ENTITY_NAME = 'talxis_attributedefinition';
export const ATTRIBUTE_VALUE_ENTITY_NAME = 'talxis_attributevalue';
export const CUSTOM_COLUMNS_REFERENED_ENTITY_NAVIGATION_NAME = 'talxis_task_talxis_attributevalue_regardingobjectid';

interface ITalxisCustomColumnsStrategyParameters {
    //entity name to fetch attributes for
    entityName: string;
    //record id to fetch attributes for
    recordId?: string;
}

export interface ITalxisCustomColumnsStrategy extends ICustomColumnsStrategy {
    saveValueToCustomColumn: (record: IRecord) => Promise<IRecordSaveOperationResult>;
    getValueFromRawRecord: (recordId: string, rawRecord: IRawRecord, column: IColumn) => any;
}

export class TalxisCustomColumnsStrategy implements ITalxisCustomColumnsStrategy {
    private _entityName: string;
    private _recordId?: string;
    private _attributes: IAttribute[] = [];
    private _attributeIdsMap: Map<string, string> = new Map();

    constructor(parameters: ITalxisCustomColumnsStrategyParameters) {
        this._entityName = parameters.entityName;
        this._recordId = parameters.recordId;
    }

    public async onRefresh(): Promise<IColumn[]> {
        const entityDefinition = await DynamicEntityDefinition.fetchForRecord(this._entityName, this._recordId);
        this._attributes = entityDefinition.Attributes;
        return this.onGetColumns();
    }

    public onGetColumns(): IColumn[] {
        return this._attributes.map(attr => {
            const dataType = Attribute.GetDataTypeFromMetadata({ ...attr as any, attributeDescriptor: attr });
            return {
                name: `${attr.LogicalName}${DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX}`,
                isVirtual: true,
                displayName: attr.DisplayName,
                dataType: dataType,
                visualSizeFactor: 200,
                metadata: this._getMetadataForDataType(dataType, attr) as any
            }
        })
    }

    public async onDeleteColumn(columnName: string): Promise<string | null> {
        const id = columnName.split(`${DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX}`)[0];
        await window.Xrm.WebApi.deleteRecord(ATTRIBUTE_DEFINITION_ENTITY_NAME, id);
        await this.onRefresh();
        return columnName
    }

    public async onCreateColumn(): Promise<string | null> {
        const { savedEntityReference } = await window.Xrm.Navigation.navigateTo({
            entityName: ATTRIBUTE_DEFINITION_ENTITY_NAME,
            pageType: 'entityrecord',
            data: {
                'talxis_entityname': this._entityName,
                'talxis_recordid': this._recordId,
            }
        }, {
            target: 2,
        });
        if (savedEntityReference && savedEntityReference.length > 0) {
            const entityReference = savedEntityReference[0];
            const id = Sanitizer.Guid.removeGuidBrackets(entityReference.id);
            await this.onRefresh();
            return `${id}${DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX}`;
        }
        else return null
    }

    public async onUpdateColumn(columnName: string): Promise<string | null> {
        const attributeDefinitionId = columnName.split(`${DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX}`)[0];
        await window.Xrm.Navigation.navigateTo({
            entityName: ATTRIBUTE_DEFINITION_ENTITY_NAME,
            pageType: 'entityrecord',
            entityId: attributeDefinitionId
        }, {
            target: 2,
        });
        await this.onRefresh();
        return columnName;
    }

    public async saveValueToCustomColumn(record: IRecord): Promise<IRecordSaveOperationResult> {
        const dirtyField = record.getFields().find(field => field.isDirty());
        const column = dirtyField?.getColumn();

        if (!column?.name.endsWith(DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX)) {
            return {
                success: true,
                fields: [],
                recordId: record.getRecordId(),
            }
        }
        const attributeDefinitionId = column.name.split(`${DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX}`)[0];
        const regardingObjectId = record.getRecordId();
        const attributeValueId = this._attributeIdsMap.get(`${regardingObjectId}_${attributeDefinitionId}`);
        const payload = {
            [this._getFieldNameForColumn(column)]: this._getValueForPayload(record.getValue(column.name), column),
            'talxis_serialized_value': this._getSerializedValue(record.getValue(column.name)),
        }

        try {

            if (!attributeValueId) {
                const result = await window.Xrm.WebApi.createRecord(ATTRIBUTE_VALUE_ENTITY_NAME, {
                    ...payload,
                    'talxis_attributedefinitionid@odata.bind': `/talxis_attributedefinitions(${attributeDefinitionId})`,
                    'talxis_regardingobjectid_task@odata.bind': `/tasks(${regardingObjectId})`,
                });
                this._attributeIdsMap.set(`${regardingObjectId}_${attributeDefinitionId}`, result.id);
                return {
                    success: true,
                    recordId: result.id,
                    fields: [column.name]
                }
            }

            else {
                await window.Xrm.WebApi.updateRecord(ATTRIBUTE_VALUE_ENTITY_NAME, attributeValueId, {
                    ...payload
                });
                return {
                    success: true,
                    recordId: attributeValueId,
                    fields: [column.name]
                }
            }
        }
        catch (err: any) {
            return {
                success: false,
                recordId: attributeValueId ?? '',
                fields: [column.name],
                errors: [{
                    message: err.message,
                    fieldName: column.name
                }]
            }
        }
    }

    public getValueFromRawRecord(recordId: string, rawRecord: IRawRecord, column: IColumn) {
        const attribute = this._getAttributeFromRawRecord(recordId, rawRecord, column);
        if (attribute == null) {
            return null;
        }
        const fieldName = this._getFieldNameForColumn(column);

        if (column.dataType === DataTypes.OptionSet) {
            const metadata = column.metadata as any;
            const optionSet = metadata.OptionSet as any;
            const option = optionSet.find((option: any) => option.OptionId == attribute['_talxis_choice_value_value']);
            return option ? option.Value : null;
        }
        return new FieldValue(attribute[fieldName], column.dataType).getValue();
    }

    private _getAttributeFromRawRecord(recordId: string, rawRecord: IRawRecord, column: IColumn) {
        const attributes: any[] = rawRecord[CUSTOM_COLUMNS_REFERENED_ENTITY_NAVIGATION_NAME] ?? [];
        if (attributes.length === 0) {
            return null;
        }
        const attributeDefinitionId = column.name.split(`${DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX}`)[0];
        const attribute = attributes.find(attr => attr['_talxis_attributedefinitionid_value'] === attributeDefinitionId);
        if (attribute) {
            this._attributeIdsMap.set(`${recordId}_${attributeDefinitionId}`, attribute['talxis_attributevalueid']);
        }
        return attribute;
    }

    private _getFieldNameForColumn(column: IColumn): string {
        switch (column.dataType) {
            case DataTypes.WholeNone:
            case DataTypes.WholeDuration:
            case DataTypes.WholeLanguage:
            case DataTypes.WholeTimeZone:
                return 'talxis_int_value';
            case DataTypes.Decimal:
                return 'talxis_decimal_value';
            case DataTypes.OptionSet:
                return 'talxis_choice_value@odata.bind';
            case DataTypes.TwoOptions:
                return 'talxis_bit_value';
            case DataTypes.DateAndTimeDateOnly:
                return 'talxis_date_value';
            case DataTypes.DateAndTimeDateAndTime: {
                return column.metadata?.Behavior === 3 ? 'talxis_datetime_tzi_value' : 'talxis_datetime_userlocal_value';
            }
            default:
                return 'talxis_text_value';
        }
    }

    private _getValueForPayload(value: any, column: IColumn): any {
        switch (column.dataType) {
            case 'TwoOptions': {
                return value == '1' ? true : false;
            }
            case 'OptionSet': {
                const attribute: IAttribute = column.metadata as any;
                const optionSet = attribute.OptionSet as any;
                const optionId = optionSet.find((option: any) => option.Value == value)?.OptionId;
                if (optionId) {
                    return `/talxis_attributeoptions(${optionId})`;
                }
                return null;
            }
            case 'DateAndTime.DateAndTime':
            case 'DateAndTime.DateOnly': {
                return value;
            }
            default: {
                return value;
            }
        }
    }

    //this is wrong, but it has been developed as part of dynamic attributes like this
    private _getSerializedValue(value: any) {
        return JSON.stringify({
            raw: value,
            error: false,
            errorMessage: ''
        })
    }

    private _getMetadataForDataType(dataType: DataType, attr: IAttribute) {
        switch (dataType) {
            case DataTypes.OptionSet:
            case DataTypes.TwoOptions: {
                return {
                    ...attr,
                    OptionSet: attr.OptionSet?.Options.map(option => {
                        return {
                            Label: option.Label,
                            Value: option.Value,
                            Color: option.Color,
                            OptionId: option.talxis_OptionId
                        }
                    })
                }
            }
            default: {
                return attr;
            }
        }
    }
}