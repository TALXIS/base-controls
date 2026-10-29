import { USER_QUERIES_LABELS } from "../labels";
import type { IUserQueriesModule } from "../interfaces";
import { createUserQueriesModule } from "../createUserQueriesModule";
import type { IUserQueriesCommands } from "../DatasetControlUserQueries";
import type { ILocalStorageUserQueriesProviderParameters } from "./LocalStorageUserQueriesProvider";
import { LocalStorageUserQueriesStore } from "./LocalStorageUserQueriesStore";

export interface ILocalStorageUserQueriesModuleParameters<TData> extends Omit<ILocalStorageUserQueriesProviderParameters, 'nameLabel'>, IUserQueriesCommands { }

/** The user's views kept in the browser's localStorage, with their columns and data as JSON. */
export const createLocalStorageUserQueriesModule = <TData,>(parameters: ILocalStorageUserQueriesModuleParameters<TData>): IUserQueriesModule<TData> => createUserQueriesModule<TData>({
    onCreateStore: datasetControl => new LocalStorageUserQueriesStore<TData>({ storageKey: parameters.storageKey, nameLabel: datasetControl.getLabels(USER_QUERIES_LABELS).get('userQueries.viewName') }),
    enableSaveAsNewView: parameters.enableSaveAsNewView,
    enableSaveChanges: parameters.enableSaveChanges,
    enableManageViews: parameters.enableManageViews,
});
