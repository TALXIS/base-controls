import { Attribute, DatasetConstants, DataType, DataTypes, FieldValue, IColumn, IEventEmitter, IRawRecord, IRecord, IRecordSaveOperationResult, Sanitizer } from "@talxis/client-libraries";
import { DynamicEntityDefinition } from "@talxis/client-metadata";
import { Attribute as IAttribute } from '@talxis/client-metadata/dist/interfaces/entity/IEntityDefinition';
import { ICustomColumnsStrategy } from "../../providers/custom-columns/CustomColumnsDataProvider";

export const ATTRIBUTE_DEFINITION_ENTITY_NAME = 'talxis_attributedefinition';
export const ATTRIBUTE_VALUE_ENTITY_NAME = 'talxis_attributevalue';
const CUSTOM_COLUMNS_REFERENED_ENTITY_NAVIGATION_NAME = 'talxis_task_talxis_attributevalue_regardingobjectid';

/** Constructor parameters for {@link DataverseCustomColumnsStrategy}. */
interface IDataverseCustomColumnsStrategyParameters {
    /** Logical name of the entity for which dynamic attribute definitions are managed (e.g. `"task"`). */
    entityName: string;
    /** Optional record ID used to scope attribute definitions to a specific parent record. */
    recordId?: string;
}

/**
 * Extends {@link ICustomColumnsStrategy} with Dataverse-specific accessors needed to persist
 * custom column values through the `talxis_attributevalue` entity.
 */
export interface IDataverseCustomColumnsStrategy extends ICustomColumnsStrategy {
    getNavigationPropertyName: () => string;
    getAttributeDefinitionIdFromColumnName: (columnName: string) => string;
    /** Returns the `$expand` query parameter needed to fetch the related `talxis_attributevalue` records. */
    getExpand: () => string;
    /** Reads and returns the typed value for `column` from the raw attribute-value payload embedded in `rawRecord`. */
    getValueFromRawRecord: (recordId: string, rawRecord: IRawRecord, column: IColumn) => any;
}

/**
 * Work-in-progress {@link ICustomColumnsStrategy} implementation for the Dataverse / Talxis platform.
 *
 * Dynamic (user-defined) columns are modelled as `talxis_attributedefinition` records.
 * Column values are stored as `talxis_attributevalue` records linked to the task record.
 *
 * WARNING: This strategy is still WIP and should not yet be used in production.
 *
 * Pass an instance to the `onCreateCustomColumnsStrategy` hook of your descriptor to enable the
 * custom-columns feature in the TaskGrid.
 */
export class DataverseCustomColumnsStrategy implements IDataverseCustomColumnsStrategy {
    private _entityName: string;
    private _recordId?: string;
    private _attributes: IAttribute[] = [];
    private _attributeIdsMap: Map<string, string> = new Map();

    /** @param parameters — see {@link IDataverseCustomColumnsStrategyParameters}. */
    constructor(parameters: IDataverseCustomColumnsStrategyParameters) {
        this._entityName = parameters.entityName;
        this._recordId = parameters.recordId;
    }

    /** Fetches the latest `talxis_attributedefinition` records for the entity/record scope and returns them as `IColumn[]`. */
    public async onRefresh(): Promise<IColumn[]> {
        const entityDefinition = await DynamicEntityDefinition.fetchForRecord(this._entityName, this._recordId);
        this._attributes = entityDefinition.Attributes;
        return this.onGetColumns();
    }

    //get all attribute values based given the 
    public async onGetRawRecords(): Promise<IRawRecord[]> {
        return [];
    }

    public async onGetRawRecord(recordId: string): Promise<IRawRecord> {
        throw new Error('Method not implemented.');
    }

    public getAttributeDefinitionIdFromColumnName(columnName: string): string {
        return columnName.split(`${DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX}`)[0];
    }

    public getNavigationPropertyName(): string {
        return CUSTOM_COLUMNS_REFERENED_ENTITY_NAVIGATION_NAME;
    }

    /** Returns the currently cached attribute definitions as `IColumn[]` without a network fetch. */
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

    /** Deletes the `talxis_attributedefinition` record backing `columnName`, then refreshes the column list. Returns the deleted column name. */
    public async onDeleteColumn(columnName: string): Promise<string | null> {
        const id = columnName.split(`${DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX}`)[0];
        await window.Xrm.WebApi.deleteRecord(ATTRIBUTE_DEFINITION_ENTITY_NAME, id);
        await this.onRefresh();
        return columnName
    }

    /** Opens the `talxis_attributedefinition` entity record form in a side dialog. Returns the new column name (with the custom-column suffix) when the record is saved, or `null` when the dialog is dismissed. */
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

    public getExpand(): string {
        return `${CUSTOM_COLUMNS_REFERENED_ENTITY_NAVIGATION_NAME}(
                $select=talxis_serialized_value,talxis_text_value,talxis_int_value,talxis_decimal_value,_talxis_choice_value_value,talxis_bit_value,talxis_date_value,talxis_datetime_userlocal_value,talxis_datetime_tzi_value,_talxis_attributedefinitionid_value
        )`
    }

    /** Opens the existing `talxis_attributedefinition` record in a side dialog for editing, then refreshes columns. Returns `columnName` unchanged. */
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

    /**
     * Upserts the `talxis_attributevalue` record for the dirty custom-column field on `record`.
     * Creates a new record when no value exists yet; updates the existing one otherwise.
     * @returns A save-operation result indicating success or the encountered error.
     */
    public async onSaveValue(regardingRecordId: string, column: IColumn, value: any): Promise<IRecordSaveOperationResult> {
        const attributeDefinitionId = column.name.split(`${DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX}`)[0];
        const attributeValueId = this._attributeIdsMap.get(`${regardingRecordId}_${attributeDefinitionId}`);
        const payload = {
            [this._getFieldNameForColumn(column)]: this._getValueForPayload(value, column),
            'talxis_serialized_value': this._getSerializedValue(value),
        }

        try {

            if (!attributeValueId) {
                const result = await window.Xrm.WebApi.createRecord(ATTRIBUTE_VALUE_ENTITY_NAME, {
                    ...payload,
                    'talxis_attributedefinitionid@odata.bind': `/talxis_attributedefinitions(${attributeDefinitionId})`,
                    'talxis_regardingobjectid_task@odata.bind': `/tasks(${regardingRecordId})`,
                });
                this._attributeIdsMap.set(`${regardingRecordId}_${attributeDefinitionId}`, result.id);
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

    /**
     * Resolves the typed value for `column` from the embedded `talxis_attributevalue` collection inside `rawRecord`.
     * Also caches the `talxis_attributevalueid` for subsequent upsert calls in {@link saveValueToCustomColumn}.
     * @returns The typed column value, or `null` when no matching attribute value record is found.
     */
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
        return attribute[fieldName];
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