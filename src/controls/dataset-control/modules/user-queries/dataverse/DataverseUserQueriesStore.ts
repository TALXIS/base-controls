import type { IDataProvider } from "@talxis/client-libraries";
import type { IUserQueriesStore, IUserQueryListItem, IUserQueryView } from "../interfaces";
import { DataverseUserQueriesProvider, IDataverseUserQueriesProviderParameters } from "./DataverseUserQueriesProvider";
import { renderViewsFetchXml } from "./fetchXml";

/** The user's views as records of a Dataverse table, read and written through the Web API. */
export class DataverseUserQueriesStore<TData = unknown> implements IUserQueriesStore<TData> {
    private _parameters: IDataverseUserQueriesProviderParameters;

    constructor(parameters: IDataverseUserQueriesProviderParameters) {
        this._parameters = parameters;
    }

    public async getViews(): Promise<IUserQueryListItem[]> {
        const { table } = this._parameters;
        const fetchXml = renderViewsFetchXml(this._parameters, [table.fieldMapping.name]);
        const result = await window.Xrm.WebApi.retrieveMultipleRecords(table.name, `?fetchXml=${encodeURIComponent(fetchXml)}`);
        return result.entities.map(entity => ({ id: entity[this._getPrimaryIdAttribute()], name: entity[table.fieldMapping.name] ?? '' }));
    }

    public async getView(viewId: string): Promise<IUserQueryView<TData>> {
        const { name, fieldMapping } = this._parameters.table;
        const entity = await window.Xrm.WebApi.retrieveRecord(name, viewId, `?$select=${fieldMapping.layout}`);
        return readLayout<TData>(entity[fieldMapping.layout]);
    }

    public async createView(viewName: string, view: IUserQueryView<TData>): Promise<string> {
        const { table, entityName, recordId } = this._parameters;
        const { name, layout, returnedTypeCode, recordId: recordIdAttribute } = table.fieldMapping;
        const entity: Record<string, unknown> = { [name]: viewName, [layout]: JSON.stringify(view), [returnedTypeCode]: entityName };
        if (recordIdAttribute) {
            entity[recordIdAttribute] = recordId ?? null;
        }
        const result = await window.Xrm.WebApi.createRecord(table.name, entity);
        return result.id;
    }

    public async updateView(viewId: string, view: IUserQueryView<TData>): Promise<void> {
        const { name, fieldMapping } = this._parameters.table;
        await window.Xrm.WebApi.updateRecord(name, viewId, { [fieldMapping.layout]: JSON.stringify(view) });
    }

    public createManageProvider(): IDataProvider {
        return new DataverseUserQueriesProvider(this._parameters);
    }

    //Dataverse names a table's primary key after the table
    private _getPrimaryIdAttribute(): string {
        return `${this._parameters.table.name}id`;
    }
}

//a layout from before views kept their columns holds only the data
const readLayout = <TData,>(json: string | null): IUserQueryView<TData> => {
    const layout = json ? JSON.parse(json) : {};
    const isView = Array.isArray(layout.columns) && Object.keys(layout).every(key => ['columns', 'linking', 'data'].includes(key));
    return isView ? layout : { columns: [], data: layout };
};
