import type { IDataProvider, IRecord } from "@talxis/client-libraries";
import { LocalizationService } from "@utils";
import { IUserQueriesLabels, USER_QUERIES_LABELS } from "./labels";
import type { IUserQueriesModule, IUserQuerySaveParameters } from "./interfaces";
import { DatasetControlUserQueries } from "./DatasetControlUserQueries";

export interface IUserQueriesModuleParameters<TData> {
    /** The user's views, one record per view. */
    provider: IDataProvider;
    /** Reads what a user view keeps from its record, as `onLoad` gets it in `view.data`. */
    getViewData: (record: IRecord) => TData;
    /** Overrides for every string of the user queries: the header, the commands and the panel. */
    labels?: Partial<IUserQueriesLabels>;
    /** Called before a view is saved, new or existing; fill in what the view keeps. */
    onBeforeSave?: (parameters: IUserQuerySaveParameters<TData>) => Promise<void> | void;
}

/** The user's own views: listed with the control's, and added and deleted through `DatasetControl.UserQueries`. */
export const createUserQueriesModule = <TData,>(parameters: IUserQueriesModuleParameters<TData>): IUserQueriesModule<TData> => ({
    onRegister: datasetControl => {
        const labels = new LocalizationService<IUserQueriesLabels>({ ...USER_QUERIES_LABELS, ...parameters.labels });
        const userQueries = new DatasetControlUserQueries({ datasetControl, provider: parameters.provider, labels, getViewData: parameters.getViewData, onBeforeSave: parameters.onBeforeSave as IUserQueriesModuleParameters<unknown>['onBeforeSave'] });
        datasetControl.services.register('userQueries', () => userQueries);
    },
});
