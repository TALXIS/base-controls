import type { IDataProvider } from "@talxis/client-libraries";
import type { IEventSubscriber, ILocalizationService, IServiceLocator } from "@utils";
import type { IDatasetControlLabels } from "../components/adapters/root/labels";
import type { IDatasetControlRuntime } from "./DatasetControlRuntime";
import type { DatasetControlViewSwitcher, IDatasetControlViewSwitcher } from "../components/adapters/view-switcher/DatasetControlViewSwitcher";
import type { DatasetControlQuickFind, IDatasetControlQuickFind } from "../components/adapters/quick-find/DatasetControlQuickFind";
import type { DatasetControlPagination, IDatasetControlPagination } from "../components/adapters/pagination/DatasetControlPagination";
import type { DatasetControlPageSizeSwitcher, IDatasetControlPageSizeSwitcher } from "../components/adapters/page-size-switcher/DatasetControlPageSizeSwitcher";
import type { DatasetControlNotifications, IDatasetControlNotifications } from "../components/adapters/notifications/DatasetControlNotifications";
import type { DatasetControlEditColumns, IDatasetControlEditColumns } from "../components/adapters/edit-columns/DatasetControlEditColumns";
import type { IRibbonRuntime } from "@controls/ribbon";

/** A view the user can switch to. */
export interface IDatasetControlView {
    /** The id `onLoad` is called with. */
    id: string;
    /** Shown in the view switcher. */
    name: string;
    /** The header the view is listed under; views without one are listed under "System views". */
    group?: string;
}

/** What the control raises as it loads and goes. */
export interface IDatasetControlEvents {
    /** A load started: the first one, a view switch or a reload. */
    onLoadStarted: () => void;
    /** A load finished, and its provider is now the one shown. */
    onLoaded: (provider: IDataProvider) => void;
    /** A load failed; the provider shown before it, if any, stays. */
    onLoadFailed: (error: unknown) => void;
    /** The control is unmounting. */
    onDestroyed: () => void;
}

/** The parts rendered inside the control, each there only while it is rendered. */
export interface IDatasetControlPartMap {
    /** `DatasetControl.ViewSwitcher`. */
    viewSwitcher: IDatasetControlViewSwitcher;
    /** `DatasetControl.Ribbon`. */
    ribbon: IRibbonRuntime;
    /** `DatasetControl.QuickFind`. */
    quickFind: IDatasetControlQuickFind;
    /** `DatasetControl.Pagination`. */
    pagination: IDatasetControlPagination;
    /** `DatasetControl.PageSizeSwitcher`. */
    pageSizeSwitcher: IDatasetControlPageSizeSwitcher;
    /** `DatasetControl.Notifications`. */
    notifications: IDatasetControlNotifications;
    /** `DatasetControl.EditColumns`. */
    editColumns: IDatasetControlEditColumns;
}

/** Looks up the parts rendered right now. */
export type IDatasetControlPartLocator = Pick<IServiceLocator<IDatasetControlPartMap>, 'get' | 'find' | 'whenAvailable'>;

/** The DatasetControl as its consumer drives it. */
export interface IDatasetControl {
    /** Subscribe to the control's events. */
    readonly events: IEventSubscriber<IDatasetControlEvents>;
    /** The parts rendered inside the control. */
    readonly parts: IDatasetControlPartLocator;
    /** The provider shown, from the last load that succeeded. */
    getProvider(): IDataProvider | undefined;
    /** The view the provider shown is for. */
    getViewId(): string | undefined;
    /** Whether a load is running. */
    isLoading(): boolean;
    /** What the last load threw, until the next one starts. */
    getError(): unknown;
    /** Mounts the control anew on the view; asks first when there are unsaved changes. */
    loadView(viewId: string): Promise<void>;
    /** Mounts the control anew on the current view; asks first when there are unsaved changes. */
    reload(): Promise<void>;
    /** Mounts the control anew on the view that failed to load. */
    retry(): Promise<void>;
}

export interface IDatasetControlServiceMap extends IDatasetControlPartMap {
    runtime: IDatasetControlRuntime;
    labels: ILocalizationService<IDatasetControlLabels>;
    viewSwitcher: DatasetControlViewSwitcher;
    quickFind: DatasetControlQuickFind;
    pagination: DatasetControlPagination;
    pageSizeSwitcher: DatasetControlPageSizeSwitcher;
    notifications: DatasetControlNotifications;
    editColumns: DatasetControlEditColumns;
}

export type IDatasetControlServiceLocator = IServiceLocator<IDatasetControlServiceMap>;
