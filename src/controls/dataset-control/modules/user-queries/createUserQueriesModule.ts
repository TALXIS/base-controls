import type { IColumn, ILinkEntityExposedExpression } from "@talxis/client-libraries";
import { LocalizationService } from "@utils";
import type { IDatasetControl } from "../../runtime/interfaces";
import { IUserQueriesLabels, USER_QUERIES_LABELS } from "./labels";
import type { IUserQueriesModule, IUserQueriesStore } from "./interfaces";
import { DatasetControlUserQueries } from "./DatasetControlUserQueries";

export interface IUserQueriesModuleParameters<TData> {
    /** Where the user's views are kept. */
    store: IUserQueriesStore<TData>;
    /** The view's own data as it is saved, beside its columns. */
    onGetViewData?: (datasetControl: IDatasetControl<TData>) => TData | Promise<TData>;
    /**
     * The definition of a column a user view keeps; a column without one is left out.
     * @param linking The view's related entities, which a column named by alias comes from.
     */
    onGetColumn: (columnName: string, linking: ILinkEntityExposedExpression[]) => IColumn | null | Promise<IColumn | null>;
    /** Overrides for every string of the user queries: the header, the commands and the panel. */
    labels?: Partial<IUserQueriesLabels>;
}

//TODO: full support needs providers to name what a view must save and to load it back from that
/** The user's own views: listed with the control's, and added and deleted through `DatasetControl.UserQueries`. */
export const createUserQueriesModule = <TData,>(parameters: IUserQueriesModuleParameters<TData>): IUserQueriesModule<TData> => ({
    name: 'userQueries',
    onLoad: async datasetControl => {
        const labels = new LocalizationService<IUserQueriesLabels>({ ...USER_QUERIES_LABELS, ...parameters.labels });
        const userQueries = new DatasetControlUserQueries({
            datasetControl,
            store: parameters.store as IUserQueriesStore,
            labels,
            onGetViewData: parameters.onGetViewData as IUserQueriesModuleParameters<unknown>['onGetViewData'],
            onGetColumn: parameters.onGetColumn,
        });
        await userQueries.load();
        return userQueries;
    },
    onDestroy: userQueries => userQueries.destroy(),
});
