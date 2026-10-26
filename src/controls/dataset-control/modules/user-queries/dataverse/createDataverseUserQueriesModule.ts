import type { IUserQueriesLabels } from "../labels";
import type { IUserQueriesModule } from "../interfaces";
import { createUserQueriesModule } from "../createUserQueriesModule";
import type { IUserQueriesCommands } from "../DatasetControlUserQueries";
import type { IDataverseUserQueriesProviderParameters } from "./DataverseUserQueriesProvider";
import { DataverseUserQueriesStore } from "./DataverseUserQueriesStore";

export interface IDataverseUserQueriesModuleParameters<TData> extends IDataverseUserQueriesProviderParameters, IUserQueriesCommands {
    /** Overrides for every string of the user queries: the header, the commands and the panel. */
    labels?: Partial<IUserQueriesLabels>;
}

/** The user's views as records of a Dataverse table, with their columns, linking and data as JSON in `table`'s layout column. */
export const createDataverseUserQueriesModule = <TData,>(parameters: IDataverseUserQueriesModuleParameters<TData>): IUserQueriesModule<TData> => createUserQueriesModule<TData>({
    onCreateStore: () => new DataverseUserQueriesStore<TData>(parameters),
    labels: parameters.labels,
    enableSaveAsNewView: parameters.enableSaveAsNewView,
    enableSaveChanges: parameters.enableSaveChanges,
    enableManageViews: parameters.enableManageViews,
});
