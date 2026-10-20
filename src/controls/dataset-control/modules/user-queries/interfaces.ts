import type { IRecord } from "@talxis/client-libraries";
import type { IDatasetControl, IDatasetControlModule } from "../../runtime/interfaces";

/** What `onWriteViewData` is called with. */
export interface IUserQueryWriteParameters<TData = unknown> {
    /** The view, unsaved; `isNew()` tells a new view from an existing one. */
    record: IRecord;
    /** The control the view is saved from, showing what the user set up. */
    datasetControl: IDatasetControl<TData>;
}

/** The user's own views, listed with the control's and managed through `DatasetControl.UserQueries`. */
export interface IUserQueriesModule<TData = unknown> extends IDatasetControlModule<'userQueries'> { }
