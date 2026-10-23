import { Attribute, DatasetConstants, DataType, DataTypes, IColumn, IRawRecord, IRecord, IRecordSaveOperationResult, Sanitizer } from "@talxis/client-libraries";
import { DynamicEntityDefinition } from "@talxis/client-metadata";
import type { Attribute as IAttribute } from "@talxis/client-metadata/dist/interfaces/entity/IEntityDefinition";
import type { IPcfContext } from "@interfaces";
import type { ITaskRuntime } from "../../../runtime";
import type { ICustomColumnsStore } from "../CustomColumns";

/** The table holding custom column definitions. */
export const ATTRIBUTE_DEFINITION_ENTITY_NAME = 'talxis_attributedefinition';
/** The table holding custom column values. */
export const ATTRIBUTE_VALUE_ENTITY_NAME = 'talxis_attributevalue';

const MAX_IDS_PER_REQUEST = 800;
const VALUE_FIELDS = ['talxis_attributevalueid', 'talxis_serialized_value', 'talxis_text_value', 'talxis_int_value', 'talxis_decimal_value', '_talxis_choice_value_value', 'talxis_bit_value', 'talxis_date_value', 'talxis_datetime_userlocal_value', 'talxis_datetime_tzi_value', '_talxis_attributedefinitionid_value'];

export interface ITalxisCustomColumnsStoreParameters {
    taskRuntime: ITaskRuntime;
    /** The logical name of the entity the columns are defined for, such as `task`. */
    entityName: string;
    /** Only the definitions of this record, such as the project. */
    recordId?: string;
    /** The relationship between the entity and `talxis_attributevalue` the values hang off; needed only when there are several. */
    navigationPropertyName?: string;
}

interface IValueRelationship {
    /** The lookup on `talxis_attributevalue` to the entity. */
    referencingAttribute: string;
    referencingEntityNavigationPropertyName: string;
    entitySetName: string;
}

/** Custom columns as TALXIS `talxis_attributedefinition` records, with each value a `talxis_attributevalue` record. */
export class TalxisCustomColumnsStore implements ICustomColumnsStore {
    private _parameters: ITalxisCustomColumnsStoreParameters;
    private _columns: IColumn[] = [];
    //keyed by task id and attribute definition id, for the upsert
    private _valueIds = new Map<string, string>();
    private _relationship?: IValueRelationship;

    constructor(parameters: ITalxisCustomColumnsStoreParameters) {
        this._parameters = parameters;
    }

    public async onLoadColumns(): Promise<IColumn[]> {
        this._relationship ??= await this._resolveRelationship();
        const entityDefinition = await DynamicEntityDefinition.fetchForRecord(this._parameters.entityName, this._parameters.recordId);
        this._columns = entityDefinition.Attributes.map(attribute => {
            const dataType = Attribute.GetDataTypeFromMetadata({ ...attribute as any, attributeDescriptor: attribute });
            return {
                name: `${attribute.LogicalName}${DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX}`,
                isVirtual: true,
                displayName: attribute.DisplayName,
                dataType,
                visualSizeFactor: 200,
                metadata: this._getMetadata(dataType, attribute) as any,
            };
        });
        return this._columns;
    }

    public async onLoadValues(taskIds: string[]): Promise<Map<string, IRawRecord>> {
        const values = new Map<string, IRawRecord>();
        if (this._columns.length === 0 || taskIds.length === 0) {
            return values;
        }
        const { referencingAttribute } = this._getRelationship();
        const taskIdField = `_${referencingAttribute}_value`;
        for (const rawValue of await this._getRawValues(taskIds, referencingAttribute, taskIdField)) {
            const taskId = rawValue[taskIdField];
            const definitionId = rawValue['_talxis_attributedefinitionid_value'];
            const column = this._columns.find(column => this._getDefinitionId(column.name) === definitionId);
            if (!column) {
                continue;
            }
            this._valueIds.set(`${taskId}_${definitionId}`, rawValue['talxis_attributevalueid']);
            values.set(taskId, { ...values.get(taskId), [column.name]: this._readValue(rawValue, column) });
        }
        return values;
    }

    public async onSaveValue(record: IRecord, column: IColumn, value: unknown): Promise<IRecordSaveOperationResult> {
        const taskId = record.getRecordId();
        const definitionId = this._getDefinitionId(column.name);
        const valueId = this._valueIds.get(`${taskId}_${definitionId}`);
        const payload = {
            [this._getFieldName(column)]: this._toPayloadValue(value, column),
            talxis_serialized_value: JSON.stringify({ raw: value, error: false, errorMessage: '' }),
        };
        try {
            if (valueId) {
                await this._getPcfContext().webAPI.updateRecord(ATTRIBUTE_VALUE_ENTITY_NAME, valueId, payload);
                return { success: true, recordId: valueId, fields: [column.name] };
            }
            const { referencingEntityNavigationPropertyName, entitySetName } = this._getRelationship();
            const created = await this._getPcfContext().webAPI.createRecord(ATTRIBUTE_VALUE_ENTITY_NAME, {
                ...payload,
                'talxis_attributedefinitionid@odata.bind': `/talxis_attributedefinitions(${definitionId})`,
                [`${referencingEntityNavigationPropertyName}@odata.bind`]: `/${entitySetName}(${taskId})`,
            });
            this._valueIds.set(`${taskId}_${definitionId}`, created.id);
            return { success: true, recordId: created.id, fields: [column.name] };
        }
        catch (error: any) {
            return { success: false, recordId: valueId ?? '', fields: [column.name], errors: [{ message: error.message, fieldName: column.name }] };
        }
    }

    public async onCreateColumn(): Promise<string | null> {
        const result = await this._navigate({
            pageType: 'entityrecord',
            entityName: ATTRIBUTE_DEFINITION_ENTITY_NAME,
            data: { talxis_entityname: this._parameters.entityName, talxis_recordid: this._parameters.recordId },
        });
        const reference = result?.savedEntityReference?.[0];
        return reference ? `${Sanitizer.Guid.removeGuidBrackets(reference.id)}${DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX}` : null;
    }

    public async onUpdateColumn(columnName: string): Promise<string | null> {
        await this._navigate({ pageType: 'entityrecord', entityName: ATTRIBUTE_DEFINITION_ENTITY_NAME, entityId: this._getDefinitionId(columnName) });
        return columnName;
    }

    public async onDeleteColumn(columnName: string): Promise<string | null> {
        await this._getPcfContext().webAPI.deleteRecord(ATTRIBUTE_DEFINITION_ENTITY_NAME, this._getDefinitionId(columnName));
        return columnName;
    }

    private async _getRawValues(taskIds: string[], referencingAttribute: string, taskIdField: string): Promise<IRawRecord[]> {
        const batches: string[][] = [];
        for (let index = 0; index < taskIds.length; index += MAX_IDS_PER_REQUEST) {
            batches.push(taskIds.slice(index, index + MAX_IDS_PER_REQUEST));
        }
        const results = await Promise.all(batches.map(async batch => {
            const ids = batch.map(id => `'${id}'`).join(',');
            const query = `?$select=${[...VALUE_FIELDS, taskIdField].join(',')}&$filter=Microsoft.Dynamics.CRM.In(PropertyName='${referencingAttribute}', PropertyValues=[${ids}])`;
            const { entities } = await this._getPcfContext().webAPI.retrieveMultipleRecords(ATTRIBUTE_VALUE_ENTITY_NAME, query);
            return entities;
        }));
        return results.flat();
    }

    //the side dialog the definition forms open in
    private async _navigate(pageInput: Xrm.Navigation.PageInputEntityRecord): Promise<any> {
        //the PCF typings leave out navigateTo
        const navigation = this._getPcfContext().navigation as ComponentFramework.Navigation & Pick<Xrm.Navigation, 'navigateTo'>;
        return navigation.navigateTo(pageInput, { target: 2 });
    }

    private _getDefinitionId(columnName: string): string {
        return columnName.split(DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX)[0];
    }

    private _getRelationship(): IValueRelationship {
        if (!this._relationship) {
            throw new Error(`${TalxisCustomColumnsStore.name} reads the relationship to ${ATTRIBUTE_VALUE_ENTITY_NAME} as its columns load.`);
        }
        return this._relationship;
    }

    //a schema has one relationship to the values; `navigationPropertyName` picks one when there are several
    private async _resolveRelationship(): Promise<IValueRelationship> {
        const { entityName, navigationPropertyName } = this._parameters;
        const metadata: any = await this._getPcfContext().utils.getEntityMetadata(entityName);
        const relationships: any[] = metadata.OneToManyRelationships.getAll().filter((relationship: any) => relationship.ReferencingEntity === ATTRIBUTE_VALUE_ENTITY_NAME);
        const relationship = navigationPropertyName
            ? relationships.find(candidate => candidate.ReferencedEntityNavigationPropertyName === navigationPropertyName || candidate.ReferencingEntityNavigationPropertyName === navigationPropertyName)
            : relationships[0];
        if (!relationship) {
            throw new Error(`No relationship between "${entityName}" and "${ATTRIBUTE_VALUE_ENTITY_NAME}"${navigationPropertyName ? ` for "${navigationPropertyName}"` : ''}; custom columns keep their values through one.`);
        }
        if (relationships.length > 1 && !navigationPropertyName) {
            throw new Error(`"${entityName}" has ${relationships.length} relationships to "${ATTRIBUTE_VALUE_ENTITY_NAME}"; pass "navigationPropertyName" to pick the one holding custom column values.`);
        }
        return {
            referencingAttribute: relationship.ReferencingAttribute,
            referencingEntityNavigationPropertyName: relationship.ReferencingEntityNavigationPropertyName,
            entitySetName: metadata.EntitySetName,
        };
    }

    private _readValue(rawValue: IRawRecord, column: IColumn): unknown {
        if (column.dataType === DataTypes.OptionSet) {
            const option = (column.metadata as any)?.OptionSet?.find((option: any) => option.OptionId == rawValue['_talxis_choice_value_value']);
            return option ? option.Value : null;
        }
        return rawValue[this._getFieldName(column)] ?? null;
    }

    private _getFieldName(column: IColumn): string {
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
            case DataTypes.DateAndTimeDateAndTime:
                return column.metadata?.Behavior === 3 ? 'talxis_datetime_tzi_value' : 'talxis_datetime_userlocal_value';
            default:
                return 'talxis_text_value';
        }
    }

    private _toPayloadValue(value: unknown, column: IColumn): unknown {
        switch (column.dataType) {
            case DataTypes.TwoOptions:
                return value == '1';
            case DataTypes.OptionSet: {
                const optionId = (column.metadata as any)?.OptionSet?.find((option: any) => option.Value == value)?.OptionId;
                return optionId ? `/talxis_attributeoptions(${optionId})` : null;
            }
            default:
                return value;
        }
    }

    private _getMetadata(dataType: DataType, attribute: IAttribute) {
        if (dataType !== DataTypes.OptionSet && dataType !== DataTypes.TwoOptions) {
            return attribute;
        }
        return {
            ...attribute,
            OptionSet: attribute.OptionSet?.Options.map(option => ({ Label: option.Label, Value: option.Value, Color: option.Color, OptionId: option.talxis_OptionId })),
        };
    }

    private _getPcfContext(): IPcfContext {
        return this._parameters.taskRuntime.services.get('pcfContext');
    }
}
