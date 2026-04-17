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

const _getFetchXml = (recordId?: string, ownerId?: string) => {
    const fetch = FetchXmlBuilder.fetch.fromXml(FETCH_XML);
    if (recordId || ownerId) {
        const filter = new FetchXmlBuilder.filter("and")
        if (recordId) {
            filter.addCondition(new FetchXmlBuilder.condition("talxis_recordid", FetchXmlBuilder.Operator.Equal, [new FetchXmlBuilder.value(recordId)]))
        }
        if (ownerId) {
            filter.addCondition(new FetchXmlBuilder.condition("ownerid", FetchXmlBuilder.Operator.Equal, [new FetchXmlBuilder.value(ownerId)]))
        }
        fetch.entity.addFilter(filter);
    }
    return fetch.toXml();
}

interface ITalxisSavedQueryParams {
    onGetSystemQueries: () => Promise<ISavedQuery[]>;
    recordId?: string;
    ownerId?: string;
}

export class TalxisSavedQueryStrategy extends FetchXmlDataProvider implements ISavedQueryStrategy {
    private _recordId?: string;
    private _onGetSystemQueries: () => Promise<ISavedQuery[]>;

    constructor(params: ITalxisSavedQueryParams) {
        const fetchXml = _getFetchXml(params.recordId, params.ownerId);
        super({ fetchXml });
        this._recordId = params.recordId;
        this._onGetSystemQueries = params.onGetSystemQueries;
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
        return {
            success: false,
            deletedQueryIds: [],
            errors: queryIds.map(id => ({ queryId: id, error: new Error('Delete not implemented') }))
        }
        const result = await this.deleteRecords(queryIds);
        if(result.success) {
            return {
                success: true,
                deletedQueryIds: queryIds
            }
        }
        else {
            return {
                success: false,
                deletedQueryIds: result.results.filter(r => r.success).map(r => r.recordId),
                errors: result.results.filter(r => !r.success).map(r => ({queryId: r.recordId, error: r.errorMessage}))
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
            'talxis_returnedtypecode': this.getEntityName(),
            'talxis_recordid': this._recordId ?? null,
        }
        const result = await window.Xrm.WebApi.createRecord('talxis_userquery', rawData);

        return result.id;
    }
}