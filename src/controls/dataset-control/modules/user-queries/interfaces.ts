import type { IColumn, IDataProvider, ILinkEntityExposedExpression } from "@talxis/client-libraries";
import type { IDatasetControlModule } from "../../runtime/interfaces";

/** What a user view keeps of a column; the provider fills in the rest. */
export type IUserQueryColumn = Pick<IColumn, 'name' | 'isHidden' | 'order' | 'visualSizeFactor' | 'grouping' | 'aggregation'>;

/** What a user view keeps. */
export interface IUserQueryView<TData = unknown> {
    columns: IUserQueryColumn[];
    /** The related entities its columns come from. */
    linking?: ILinkEntityExposedExpression[];
    data?: TData;
}

/** A user view as the view switcher lists it. */
export interface IUserQueryListItem {
    id: string;
    name: string;
}

/** Where the user's views are kept. */
export interface IUserQueriesStore<TData = unknown> {
    /** The user's views, sorted as listed. */
    getViews(): Promise<IUserQueryListItem[]>;
    getView(viewId: string): Promise<IUserQueryView<TData>>;
    /** Saves a new view and returns its id. */
    createView(name: string, view: IUserQueryView<TData>): Promise<string>;
    updateView(viewId: string, view: IUserQueryView<TData>): Promise<void>;
    /** The views as records Manage views renames and deletes. */
    createManageProvider(): IDataProvider;
}

/** The user's own views, listed with the control's and managed through `DatasetControl.UserQueries`. */
export interface IUserQueriesModule<TData = unknown> extends IDatasetControlModule<'userQueries'> { }
