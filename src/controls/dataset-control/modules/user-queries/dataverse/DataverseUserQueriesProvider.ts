import { FetchXmlDataProvider, IColumn } from "@talxis/client-libraries";
import { renderViewsFetchXml } from "./fetchXml";

/** The table the user's views are records of. */
export interface IDataverseUserQueriesTable {
    /** The table's logical name. */
    name: string;
    /** Which of the table's columns holds what. */
    fieldMapping: {
        name: string;
        /** Holds the view's columns, linking and data as JSON. */
        layout: string;
        /** Holds the logical name of the entity a view is of. */
        returnedTypeCode: string;
        /** Shown in Manage views beside the name. */
        description?: string;
        /** Holds the record a view belongs to; views are not scoped to a record without it. */
        recordId?: string;
    };
}

export interface IDataverseUserQueriesProviderParameters {
    table: IDataverseUserQueriesTable;
    /** The logical name of the entity the views are of. */
    entityName: string;
    /** Only the views of this record, when the table maps `recordId`; only views of no record when left out. */
    recordId?: string;
    /** Only the views this owner owns. */
    ownerId?: string;
}

/** The user's views as Manage views edits them: their name and description. */
export class DataverseUserQueriesProvider extends FetchXmlDataProvider {
    constructor(parameters: IDataverseUserQueriesProviderParameters) {
        super({ fetchXml: renderViewsFetchXml(parameters), loadAllRecords: true });
        const { name, description } = parameters.table.fieldMapping;
        //only what these name is fetched, listed in this order
        this.setColumns(description ? [{ name } as IColumn, { name: description } as IColumn] : [{ name } as IColumn]);
    }
}
