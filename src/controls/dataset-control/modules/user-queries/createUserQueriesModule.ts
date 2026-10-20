import type { IDataProvider, IRecord } from "@talxis/client-libraries";
import { LocalizationService } from "@utils";
import { IUserQueriesLabels, USER_QUERIES_LABELS } from "./labels";
import type { IUserQueriesModule, IUserQueryWriteParameters } from "./interfaces";
import { DatasetControlUserQueries } from "./DatasetControlUserQueries";

export interface IUserQueriesModuleParameters<TData> {
    /** The user's views, one record per view. */
    provider: IDataProvider;
    /** Reads what a user view keeps from its record, as `onLoad` gets it in `view.data`. */
    onGetViewData: (record: IRecord) => TData;
    /** Overrides for every string of the user queries: the header, the commands and the panel. */
    labels?: Partial<IUserQueriesLabels>;
    /** Writes what the control shows onto a view's record before it is saved; throw to stop the save. */
    onWriteViewData?: (parameters: IUserQueryWriteParameters<TData>) => Promise<void> | void;
}

/** The user's own views: listed with the control's, and added and deleted through `DatasetControl.UserQueries`. */
export const createUserQueriesModule = <TData,>(parameters: IUserQueriesModuleParameters<TData>): IUserQueriesModule<TData> => ({
    onLoad: async datasetControl => {
        const labels = new LocalizationService<IUserQueriesLabels>({ ...USER_QUERIES_LABELS, ...parameters.labels });
        const userQueries = new DatasetControlUserQueries({ datasetControl, provider: parameters.provider, labels, onGetViewData: parameters.onGetViewData, onWriteViewData: parameters.onWriteViewData as IUserQueriesModuleParameters<unknown>['onWriteViewData'] });
        datasetControl.services.register('userQueries', () => userQueries);
        return userQueries.load();
    },
});
