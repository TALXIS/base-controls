import type { IColumn, ILinkEntityExposedExpression } from "@talxis/client-libraries";
import type { IDatasetControl } from "../../../runtime/interfaces";
import type { IUserQueriesLabels } from "../labels";
import type { IUserQueriesModule } from "../interfaces";
import { createUserQueriesModule } from "../createUserQueriesModule";
import { getDataverseColumn } from "./getDataverseColumn";
import type { IDataverseUserQueriesProviderParameters } from "./DataverseUserQueriesProvider";
import { DataverseUserQueriesStore } from "./DataverseUserQueriesStore";

export interface IDataverseUserQueriesModuleParameters<TData> extends IDataverseUserQueriesProviderParameters {
    /** The view's own data as it is saved, beside its columns. */
    onGetViewData?: (datasetControl: IDatasetControl<TData>) => TData | Promise<TData>;
    /** The definition of a column a view keeps; read from Dataverse when left out. */
    onGetColumn?: (columnName: string, linking: ILinkEntityExposedExpression[]) => IColumn | null | Promise<IColumn | null>;
    /** Overrides for every string of the user queries: the header, the commands and the panel. */
    labels?: Partial<IUserQueriesLabels>;
}

/** The user's views as records of a Dataverse table, with their columns, linking and data as JSON in `table`'s layout column. */
export const createDataverseUserQueriesModule = <TData,>(parameters: IDataverseUserQueriesModuleParameters<TData>): IUserQueriesModule<TData> => createUserQueriesModule<TData>({
    store: new DataverseUserQueriesStore<TData>(parameters),
    onGetViewData: parameters.onGetViewData,
    onGetColumn: parameters.onGetColumn ?? ((columnName, linking) => getDataverseColumn(parameters.entityName, columnName, linking)),
    labels: parameters.labels,
});
