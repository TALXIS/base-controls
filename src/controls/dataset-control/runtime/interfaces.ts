import type { ILocalizationService, IServiceLocator } from "@utils";
import type { IDatasetControlLabels } from "../components/adapters/root/labels";
import type { IDatasetControlRuntime } from "./DatasetControlRuntime";
import type { DatasetControlViewSwitcher } from "../components/adapters/view-switcher/DatasetControlViewSwitcher";
import type { DatasetControlQuickFind } from "../components/adapters/quick-find/DatasetControlQuickFind";
import type { DatasetControlPagination } from "../components/adapters/pagination/DatasetControlPagination";
import type { DatasetControlPageSizeSwitcher } from "../components/adapters/page-size-switcher/DatasetControlPageSizeSwitcher";
import type { DatasetControlNotifications } from "../components/adapters/notifications/DatasetControlNotifications";
import type { DatasetControlEditColumns } from "../components/adapters/edit-columns/DatasetControlEditColumns";

/** A view the user can switch to. */
export interface IDatasetControlView {
    id: string;
    name: string;
    /** The header the view is listed under; views without one are listed under "System views". */
    group?: string;
}

/** Everything the control is made of; a consumer adds its own keys by augmenting this. */
export interface IDatasetControlServiceMap {
    runtime: IDatasetControlRuntime;
    /** The strings of `DatasetControl` itself. */
    labels: ILocalizationService<IDatasetControlLabels>;
    /** The parts below are there only while the part is rendered. */
    viewSwitcher: DatasetControlViewSwitcher;
    quickFind: DatasetControlQuickFind;
    pagination: DatasetControlPagination;
    pageSizeSwitcher: DatasetControlPageSizeSwitcher;
    notifications: DatasetControlNotifications;
    editColumns: DatasetControlEditColumns;
}

export type IDatasetControlServiceLocator = IServiceLocator<IDatasetControlServiceMap>;
