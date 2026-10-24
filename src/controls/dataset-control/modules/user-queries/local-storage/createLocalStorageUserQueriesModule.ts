import type { IDatasetControl } from "../../../runtime/interfaces";
import { IUserQueriesLabels, USER_QUERIES_LABELS } from "../labels";
import type { IUserQueriesModule } from "../interfaces";
import { createUserQueriesModule } from "../createUserQueriesModule";
import type { IUserQueriesCommands } from "../DatasetControlUserQueries";
import type { ILocalStorageUserQueriesProviderParameters } from "./LocalStorageUserQueriesProvider";
import { LocalStorageUserQueriesStore } from "./LocalStorageUserQueriesStore";

export interface ILocalStorageUserQueriesModuleParameters<TData> extends Omit<ILocalStorageUserQueriesProviderParameters, 'nameLabel'>, IUserQueriesCommands {
    /** The view's own data as it is saved, beside its columns. */
    onGetViewData?: (datasetControl: IDatasetControl<TData>) => TData | Promise<TData>;
    /** Overrides for every string of the user queries: the header, the commands and the panel. */
    labels?: Partial<IUserQueriesLabels>;
}

/** The user's views kept in the browser's localStorage, with their columns and data as JSON. */
export const createLocalStorageUserQueriesModule = <TData,>(parameters: ILocalStorageUserQueriesModuleParameters<TData>): IUserQueriesModule<TData> => createUserQueriesModule<TData>({
    onCreateStore: () => new LocalStorageUserQueriesStore<TData>({ storageKey: parameters.storageKey, nameLabel: parameters.labels?.viewName ?? USER_QUERIES_LABELS.viewName }),
    onGetViewData: parameters.onGetViewData,
    labels: parameters.labels,
    enableSaveAsNewView: parameters.enableSaveAsNewView,
    enableSaveChanges: parameters.enableSaveChanges,
    enableManageViews: parameters.enableManageViews,
});
