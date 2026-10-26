import { LocalizationService } from "@utils";
import type { IDatasetControl } from "../../runtime/interfaces";
import { IUserQueriesLabels, USER_QUERIES_LABELS } from "./labels";
import type { IUserQueriesModule, IUserQueriesStore } from "./interfaces";
import { DatasetControlUserQueries, IUserQueriesCommands } from "./DatasetControlUserQueries";

export interface IUserQueriesModuleParameters<TData> extends IUserQueriesCommands {
    /** Makes the store the user's views are kept in. */
    onCreateStore: (datasetControl: IDatasetControl<TData>) => IUserQueriesStore<TData>;
    /** Overrides for every string of the user queries: the header, the commands and the panel. */
    labels?: Partial<IUserQueriesLabels>;
}

/** The user's own views: listed with the control's, and added and deleted through `DatasetControl.UserQueries`. */
export const createUserQueriesModule = <TData,>(parameters: IUserQueriesModuleParameters<TData>): IUserQueriesModule<TData> => ({
    name: 'userQueries',
    onLoad: async datasetControl => {
        const labels = new LocalizationService<IUserQueriesLabels>({ ...USER_QUERIES_LABELS, ...parameters.labels });
        const userQueries = new DatasetControlUserQueries({
            datasetControl,
            store: parameters.onCreateStore(datasetControl as IDatasetControl<TData>) as IUserQueriesStore,
            labels,
            commands: { enableSaveAsNewView: parameters.enableSaveAsNewView, enableSaveChanges: parameters.enableSaveChanges, enableManageViews: parameters.enableManageViews },
        });
        await userQueries.load();
        return userQueries;
    },
    onDestroy: userQueries => userQueries.destroy(),
});
