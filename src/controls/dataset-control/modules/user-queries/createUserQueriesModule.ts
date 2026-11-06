import type { IDatasetControl } from "../../runtime/interfaces";
import type { IUserQueriesModule, IUserQueriesStore } from "./interfaces";
import { DatasetControlUserQueries, IUserQueriesCommands } from "./DatasetControlUserQueries";

export interface IUserQueriesModuleParameters<TData> extends IUserQueriesCommands {
    /** Makes the store the user's views are kept in. */
    onCreateStore: (datasetControl: IDatasetControl<TData>) => IUserQueriesStore<TData>;
}

/** The user's own views: listed with the control's, and added and deleted through `DatasetControl.UserQueries`. */
export const createUserQueriesModule = <TData,>(parameters: IUserQueriesModuleParameters<TData>): IUserQueriesModule<TData> => ({
    name: 'userQueries',
    onLoad: async datasetControl => {
        const { onCreateStore, ...commands } = parameters;
        const userQueries = new DatasetControlUserQueries({ ...commands, datasetControl, store: onCreateStore(datasetControl as IDatasetControl<TData>) as IUserQueriesStore });
        await userQueries.load();
        return userQueries;
    },
    onDestroy: userQueries => userQueries.destroy(),
});
