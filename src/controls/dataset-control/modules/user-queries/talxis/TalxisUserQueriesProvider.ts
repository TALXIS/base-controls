import { FetchXmlDataProvider, IRawRecord, IRecord } from "@talxis/client-libraries";
import { Liquid } from "liquidjs";

const FETCH_XML = `
<fetch count="5000" page="1">
    <entity name="talxis_userquery">
        <attribute name="talxis_userqueryid" />
        <attribute name="talxis_name" />
        <attribute name="talxis_description" />
        <attribute name="talxis_layoutjson" />
        <attribute name="talxis_returnedtypecode" />
        <attribute name="talxis_recordid" />
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
`;

const VISIBLE_COLUMNS = ['talxis_name', 'talxis_description'];

export interface ITalxisUserQueriesProviderParameters {
    /** The logical name of the entity the views are of. */
    entityName: string;
    /** Scopes the views to one record; only views without a record when left out. */
    recordId?: string;
    /** Only the views this owner owns. */
    ownerId?: string;
}

/** The user's views as `talxis_userquery` records; a view keeps its data in `talxis_layoutjson`. */
export class TalxisUserQueriesProvider extends FetchXmlDataProvider {
    private _viewsEntityName: string;
    private _viewsRecordId?: string;

    constructor(parameters: ITalxisUserQueriesProviderParameters) {
        super({ fetchXml: new Liquid().parseAndRenderSync(FETCH_XML, parameters) });
        this._viewsEntityName = parameters.entityName;
        this._viewsRecordId = parameters.recordId;
    }

    public async onPreload(options?: { skiQuickFind?: boolean }): Promise<void> {
        await super.onPreload(options);
        //Manage views lists the views by name
        this.setColumns(this.getColumns().map(column => ({ ...column, isHidden: column.isHidden || !VISIBLE_COLUMNS.includes(column.name) })));
    }

    public newRecord(options?: { rawData?: IRawRecord; addToDataset?: boolean; index?: number; recordId?: string; position?: 'start' | 'end' }): IRecord {
        const record = super.newRecord(options);
        if (record.isNew()) {
            record.setValue('talxis_returnedtypecode', this._viewsEntityName);
            record.setValue('talxis_recordid', this._viewsRecordId ?? null);
        }
        return record;
    }
}
