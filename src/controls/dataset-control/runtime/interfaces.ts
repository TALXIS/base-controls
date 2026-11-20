import type { ITheme } from "@fluentui/react";
import type { IColumn, IDataProvider, ILinkEntityExposedExpression } from "@talxis/client-libraries";
import type { IRuntime, IRuntimeModule, IRuntimePartMap, IRuntimeParts, IServiceLocator, IServiceRegistry } from "@core";
import type { ILabels, ILabelSet, Labels, LabelsService } from "@labels";
import type { IDatasetControlInternal } from "./DatasetControlRuntime";
import type { IDatasetControlViewSwitcher } from "./parts/view-switcher/DatasetControlViewSwitcher";
import type { IDatasetControlQuickFind } from "./parts/quick-find/DatasetControlQuickFind";
import type { IDatasetControlPagination } from "./parts/pagination/DatasetControlPagination";
import type { IDatasetControlPageSizeSwitcher } from "./parts/page-size-switcher/DatasetControlPageSizeSwitcher";
import type { IDatasetControlEditColumns } from "./parts/edit-columns/DatasetControlEditColumns";
import type { IRibbon } from "@controls/ribbon";
import type { DatasetControlSurfaces, IDatasetControlSurfaces } from "./DatasetControlSurfaces";

/** A header views are listed under in the view switcher. */
export interface IDatasetControlViewGroup {
    id: string;
    name: string;
}

/** What a view sets up, resolved only when it is opened. */
/** A view's column; what it leaves out comes from the provider's available columns. */
export type IDatasetControlViewColumn = Pick<IColumn, 'name'> & Partial<IColumn>;

/** Which control draws a view's records, and how. */
export interface IDatasetControlViewControl {
    name: string;
    parameters?: { [name: string]: unknown };
}

export interface IDatasetControlViewDefinition<TData = unknown> {
    /** The columns the view shows, completed from the provider's available columns and set on it. */
    columns: IDatasetControlViewColumn[];
    /** The related entities the view's columns come from, set on the provider with them. */
    linking?: ILinkEntityExposedExpression[];
    /** What else the view carries, read through `getView().data`. */
    data?: TData;
    /** Read through `getView().control`; a user view saves it with its columns. */
    control?: IDatasetControlViewControl;
}

/** A view the user can switch to. */
export interface IDatasetControlView<TData = unknown, TProvider extends IDataProvider = IDataProvider> {
    /** Unique among the control's views. */
    id: string;
    /** Shown in the view switcher. */
    name: string;
    /** The header the view is listed under; views without one are listed under "System views". */
    group?: IDatasetControlViewGroup;
    /** Sets up the provider for the view and returns its columns, with any totals or grouping. */
    resolve: (provider: TProvider) => IDatasetControlViewDefinition<TData> | Promise<IDatasetControlViewDefinition<TData>>;
}

/** A view as it is opened, with what it sets up. */
export type IDatasetControlResolvedView<TData = unknown> = IDatasetControlView<TData> & IDatasetControlViewDefinition<TData>;

/** The parts rendered inside the control, each there only while it is rendered. */
export interface IDatasetControlPartMap extends IRuntimePartMap {
    /** `DatasetControl.ViewSwitcher`. */
    viewSwitcher: IDatasetControlViewSwitcher;
    /** `DatasetControl.Ribbon`. */
    ribbon: IRibbon;
    /** `DatasetControl.QuickFind`. */
    quickFind: IDatasetControlQuickFind;
    /** `DatasetControl.Pagination`. */
    pagination: IDatasetControlPagination;
    /** `DatasetControl.PageSizeSwitcher`. */
    pageSizeSwitcher: IDatasetControlPageSizeSwitcher;
    /** `DatasetControl.EditColumns`. */
    editColumns: IDatasetControlEditColumns;
}

/** The modules a DatasetControl loaded, by name; each module adds its own entry. */
export interface IDatasetControlModuleMap { }

/** A feature of the control, loaded on every mount before the control's `onLoad`. */
export interface IDatasetControlModule<TName extends keyof IDatasetControlModuleMap = keyof IDatasetControlModuleMap> extends IRuntimeModule<IDatasetControlModuleMap, TName, IDatasetControlInternal> { }

/** Looks up the modules the control loaded. */
export type IDatasetControlModuleLocator = IServiceLocator<IDatasetControlModuleMap>;

/** The DatasetControl as its consumer drives it; a new one for every mount. */
export interface IDatasetControl<TData = unknown> extends IRuntime {
    /** The parts rendered inside the control. */
    readonly parts: IRuntimeParts<IDatasetControlPartMap>;
    /** `DatasetControl.ViewSwitcher`; throws while it is not drawn, so read it from `onReady` on. */
    readonly viewSwitcher: IDatasetControlViewSwitcher;
    /** `DatasetControl.Ribbon`; throws while it is not drawn, so read it from `onReady` on. */
    readonly ribbon: IRibbon;
    /** `DatasetControl.QuickFind`; throws while it is not drawn, so read it from `onReady` on. */
    readonly quickFind: IDatasetControlQuickFind;
    /** `DatasetControl.Pagination`; throws while it is not drawn, so read it from `onReady` on. */
    readonly pagination: IDatasetControlPagination;
    /** `DatasetControl.PageSizeSwitcher`; throws while it is not drawn, so read it from `onReady` on. */
    readonly pageSizeSwitcher: IDatasetControlPageSizeSwitcher;
    /** `DatasetControl.EditColumns`; throws while it is not drawn, so read it from `onReady` on. */
    readonly editColumns: IDatasetControlEditColumns;
    /** The modules the control loaded, by name. */
    readonly modules: IDatasetControlModuleLocator;
    /** What modules draw in the control. */
    readonly surfaces: IDatasetControlSurfaces;
    /** The provider shown, once the status is `ready`. */
    getProvider(): IDataProvider | undefined;
    /** The views of this mount, from `onLoad`; empty before they loaded. */
    getViews(): IDatasetControlView<TData>[];
    /** The view the provider shown is for. */
    getViewId(): string | undefined;
    /** That view as it was resolved, with its columns and data. */
    getView(): IDatasetControlResolvedView<TData> | undefined;
    /** Mounts the control anew on the view; asks first when there are unsaved changes. */
    loadView(viewId: string): Promise<void>;
    /** Mounts the control anew on the current view; asks first when there are unsaved changes. */
    reload(): Promise<void>;
    /** The strings of one set, as the control's `LabelsProvider` gives them. */
    getLabels<T extends Labels>(set: ILabelSet<T>): ILabels<T>;
    /** The Fluent theme the control is drawn in. */
    getTheme(): ITheme;
}

export interface IDatasetControlServiceMap {
    runtime: IDatasetControlInternal;
    labels: Pick<LabelsService, 'getLabels'>;
    surfaces: DatasetControlSurfaces;
}

export type IDatasetControlServiceRegistry = IServiceRegistry<IDatasetControlServiceMap>;
