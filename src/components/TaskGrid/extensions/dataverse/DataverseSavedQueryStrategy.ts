import { FetchXmlBuilder, FetchXmlDataProvider } from "@talxis/client-libraries";
import { IDeletedUserQueriesResult, ISavedQuery, ISavedQueryStrategy } from "./SavedQueryDataProvider";
import { ErrorHelper } from "../../../../utils/error-handling";

const FETCH_XML = `
<fetch count="5000" page="1">
    <entity name="talxis_userquery">
        <attribute name="talxis_userqueryid" />
        <attribute name="talxis_name" />
        <attribute name="talxis_description" />
        <attribute name="talxis_layoutjson" />
        <order attribute="talxis_name" />
    </entity>
</fetch>
`

const _getFetchXml = (entityName: string, recordId?: string, ownerId?: string) => {
    const fetch = FetchXmlBuilder.fetch.fromXml(FETCH_XML);
    const filter = new FetchXmlBuilder.filter("and")
    filter.addCondition(new FetchXmlBuilder.condition("talxis_returnedtypecode", FetchXmlBuilder.Operator.Equal, [new FetchXmlBuilder.value(entityName)]));
    if (ownerId) {
        filter.addCondition(new FetchXmlBuilder.condition("ownerid", FetchXmlBuilder.Operator.Equal, [new FetchXmlBuilder.value(ownerId)]))
    }
    if (recordId) {
        filter.addCondition(new FetchXmlBuilder.condition("talxis_recordid", FetchXmlBuilder.Operator.Equal, [new FetchXmlBuilder.value(recordId)]))
    }
    else {
        filter.addCondition(new FetchXmlBuilder.condition("talxis_recordid", FetchXmlBuilder.Operator.Null));
    }
    fetch.entity.addFilter(filter);
    return fetch.toXml();
}

/**
 * Parameters for constructing a {@link TalxisSavedQueryStrategy}.
 */
interface ITalxisSavedQueryStrategyParameters {
    /** Callback that retrieves the system (shared) saved queries. */
    onGetSystemQueries: () => Promise<ISavedQuery[]>;
    /** Logical name of the entity whose queries are managed (used as `talxis_returnedtypecode`). */
    entityName: string;
    /** Optional record ID used to scope queries to a specific record (`talxis_recordid`). When omitted, only queries with a null `talxis_recordid` are returned. */
    recordId?: string;
    /** Optional owner ID used to filter queries by owner (`ownerid`). */
    ownerId?: string;
}

export class TalxisSavedQueryStrategy extends FetchXmlDataProvider implements ISavedQueryStrategy {
    private _recordId?: string;
    private _parentEntityName: string;
    private _onGetSystemQueries: () => Promise<ISavedQuery[]>;

    constructor(parameters: ITalxisSavedQueryStrategyParameters) {
        const fetchXml = _getFetchXml(parameters.entityName, parameters.recordId, parameters.ownerId);
        super({ fetchXml });
        this._parentEntityName = parameters.entityName;
        this._recordId = parameters.recordId;
        this._onGetSystemQueries = parameters.onGetSystemQueries;
    }

    public async onGetUserQueries(): Promise<ISavedQuery[]> {
        const result = await this.refresh();
        return result.map(r => {
            return {
                id: r.getValue('talxis_userqueryid'),
                name: r.getValue('talxis_name'),
                description: r.getValue('talxis_description'),
                ...JSON.parse(r.getValue('talxis_layoutjson'))
            }
        });
    }

    public async onGetSystemQueries(): Promise<ISavedQuery[]> {
        return this._onGetSystemQueries();
    }

    public async onDeleteUserQueries(queryIds: string[]): Promise<IDeletedUserQueriesResult> {
        const result = await this.deleteRecords(queryIds);
        if (result.success) {
            return {
                success: true,
                deletedQueryIds: queryIds
            }
        }
        else {
            return {
                success: false,
                deletedQueryIds: result.results.filter(r => r.success).map(r => r.recordId),
                errors: result.results.filter(r => !r.success).map(r => ({ queryId: r.recordId, error: r.errorMessage }))
            }
        }
    }

    public async onUpdateUserQuery(currentQuery: ISavedQuery): Promise<string | null> {
        const record = this.getRecordsMap()[currentQuery.id];
        if (!record) {
            throw new Error(`Query record with id ${currentQuery.id} not found`);
        }
        const { name, id, ...queryMetadata } = currentQuery;
        record.setValue('talxis_layoutjson', JSON.stringify(queryMetadata));
        const result = await record.save();
        if (!result.success) {
            throw new Error(`Failed to update query with id ${currentQuery.id}: ${ErrorHelper.getMessageFromError(result.errors?.map((e: any) => e.message).join('\n'))}`);
        }
        return currentQuery.id;
    }

    public async onCreateUserQuery(newQuery: { name: string; description?: string; }, currentQuery: ISavedQuery): Promise<string | null> {
        const userqueryid = `00001111${crypto.randomUUID().substring(8)}`;
        const { name, description } = newQuery;
        const { id, name: queryName, ...queryMetadata } = currentQuery;

        const rawData = {
            'talxis_userqueryid': userqueryid,
            'talxis_layoutjson': JSON.stringify(queryMetadata),
            'talxis_name': name,
            'talxis_description': description,
            'talxis_returnedtypecode': this._parentEntityName,
            'talxis_recordid': this._recordId ?? null,
        }
        const result = await window.Xrm.WebApi.createRecord('talxis_userquery', rawData);

        return result.id;
    }
}