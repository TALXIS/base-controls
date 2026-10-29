import type { IUserQueriesModule } from "../interfaces";
import { createUserQueriesModule } from "../createUserQueriesModule";
import type { IUserQueriesCommands } from "../DatasetControlUserQueries";
import type { IDataverseUserQueriesProviderParameters } from "./DataverseUserQueriesProvider";
import { DataverseUserQueriesStore } from "./DataverseUserQueriesStore";

export interface IDataverseUserQueriesModuleParameters<TData> extends IDataverseUserQueriesProviderParameters, IUserQueriesCommands { }

/** The user's views as records of a Dataverse table, with their columns, linking and data as JSON in `table`'s layout column. */
export const createDataverseUserQueriesModule = <TData,>(parameters: IDataverseUserQueriesModuleParameters<TData>): IUserQueriesModule<TData> => createUserQueriesModule<TData>({
    onCreateStore: () => new DataverseUserQueriesStore<TData>(parameters),
    enableSaveAsNewView: parameters.enableSaveAsNewView,
    enableSaveChanges: parameters.enableSaveChanges,
    enableManageViews: parameters.enableManageViews,
});
