import { FetchXmlDataProvider } from "@talxis/client-libraries";
import { Liquid } from "liquidjs";
import { IDeletedUserQueriesResult, ISavedQuery, IUserQueryStrategy } from "@components/TaskGrid/providers/saved-query/SavedQueryDataProvider";
import { ErrorHelper } from "@utils/error-handling";

const FETCH_XML = `
<fetch count="5000" page="1">
    <entity name="talxis_userquery">
        <attribute name="talxis_userqueryid" />
        <attribute name="talxis_name" />
        <attribute name="talxis_description" />
        <attribute name="talxis_layoutjson" />
        <filter type="and">
            <condition attribute="talxis_returnedtypecode" operator="eq" value="{{ entityName }}" />
            {% if ownerId %}
            <condition attribute="ownerid" operator="eq" value="{{ ownerId }}" />
            {% endif %}
            {% if recordId %}
            <condition attribute="talxis_recordid" operator="eq" value="{{ recordId }}" />
            {% else %}
            <condition attribute="talxis_recordid" operator="null" />
            {% endif %}
        </filter>
        <order attribute="talxis_name" />
    </entity>
</fetch>
`

const LIQUID = new Liquid();

const _getFetchXml = (entityName: string, recordId?: string, ownerId?: string) => {
    return LIQUID.parseAndRenderSync(FETCH_XML, { entityName, recordId, ownerId });
}

/** Constructor parameters for {@link DataverseUserQueryStrategy}. */
export interface IDataverseUserQueryStrategyParameters {
    /** Logical name of the entity whose queries are managed (used as `talxis_returnedtypecode`). */
    entityName: string;
    /** Optional record ID used to scope queries to a specific record (`talxis_recordid`). When omitted, only queries with a null `talxis_recordid` are returned. */
    recordId?: string;
    /** Optional owner ID used to filter queries by owner (`ownerid`). */
    ownerId?: string;
}

/**
 * Ready-to-use {@link IUserQueryStrategy} implementation for the Dataverse / Talxis platform.
 *
 * Persists personal views as `talxis_userquery` records, optionally scoped to a specific parent record
 * (`talxis_recordid`) and/or owner (`ownerid`) — so the environment needs that table. Return it from
 * it to `createUserQueryModule()` and return that from the descriptor's `modules.onGetUserQueriesModule`
 * to switch personal views on.
 */
export class DataverseUserQueryStrategy extends FetchXmlDataProvider implements IUserQueryStrategy {
    private _recordId?: string;
    private _parentEntityName: string;

    constructor(parameters: IDataverseUserQueryStrategyParameters) {
        const fetchXml = _getFetchXml(parameters.entityName, parameters.recordId, parameters.ownerId);
        super({ fetchXml });
        this._parentEntityName = parameters.entityName;
        this._recordId = parameters.recordId;
    }

    /** A query is the user's own when it came from `talxis_userquery` — that is, when this provider holds it. */
    public onIsUserQuery(queryId: string): boolean {
        return !!this.getRecordsMap()[queryId];
    }

    /** Fetches all `talxis_userquery` records matching the configured entity/record/owner scope and maps them to {@link ISavedQuery}. */
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

    /** Deletes the specified `talxis_userquery` records and returns a per-query success/failure result. */
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

    /** Serialises the current query metadata (columns, filters, sorting, …) to `talxis_layoutjson` and saves the record. Returns the query ID on success. */
    public async onUpdateUserQuery(currentQuery: ISavedQuery): Promise<string | null> {
        const record = this.getRecordsMap()[currentQuery.id];
        if (!record) {
            throw new Error(`Query record with id ${currentQuery.id} not found`);
        }
        const { name, id, description, ...queryMetadata } = currentQuery;
        record.setValue('talxis_name', name);
        record.setValue('talxis_description', description ?? null);
        record.setValue('talxis_layoutjson', JSON.stringify(queryMetadata));
        const result = await record.save();
        if (!result.success) {
            throw new Error(`Failed to update query with id ${currentQuery.id}: ${ErrorHelper.getMessageFromError(result.errors?.map((e: any) => e.message).join('\n'))}`);
        }
        return currentQuery.id;
    }

    /**
     * Creates a new `talxis_userquery` record that captures the current grid state (columns, filters, sorting, …).
     * A deterministic ID is generated with a `00001111` prefix so it sorts predictably alongside Dataverse-native GUIDs.
     * @returns The new record ID on success.
     */
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
