import { Root } from './components/adapters/root';
import { Header } from './components/adapters/header';
import { Body } from './components/adapters/body';
import { Footer } from './components/adapters/footer';
import { DatasetControlViewSwitcher, ViewSwitcher } from './components/adapters/view-switcher';
import { Ribbon } from './components/adapters/ribbon';
import { DatasetControlQuickFind, QuickFind } from './components/adapters/quick-find';
import { DatasetControlNotifications, Notifications } from './components/adapters/notifications';
import { DatasetControlPagination, Pagination } from './components/adapters/pagination';
import { DatasetControlPageSizeSwitcher, PageSizeSwitcher } from './components/adapters/page-size-switcher';
import { EmptyRecords } from './components/adapters/empty-records';
import { DatasetControlEditColumns, DatasetControlEditColumnsSession, EditColumns } from './components/adapters/edit-columns';
import { DatasetControlUi, IDatasetControlUi } from './components/ui';

/** The classes the parts create, for typing and extending them. */
export interface IDatasetControlClasses {
    ViewSwitcher: typeof DatasetControlViewSwitcher;
    QuickFind: typeof DatasetControlQuickFind;
    Notifications: typeof DatasetControlNotifications;
    Pagination: typeof DatasetControlPagination;
    PageSizeSwitcher: typeof DatasetControlPageSizeSwitcher;
    EditColumns: typeof DatasetControlEditColumns;
    EditColumnsSession: typeof DatasetControlEditColumnsSession;
}

/** The parts of the control, attached to the control itself. */
export interface IDatasetControlParts {
    /** The row above the records; `Header.Start` and `Header.End` are its left and right regions. */
    Header: typeof Header;
    /** What fills the height the header and footer leave, holding what shows the records. */
    Body: typeof Body;
    /** The row below the records; `Footer.Start` and `Footer.End` are its left and right regions. */
    Footer: typeof Footer;
    ViewSwitcher: typeof ViewSwitcher;
    /** The shared `Ribbon`, loaded again whenever the selected records change. */
    Ribbon: typeof Ribbon;
    QuickFind: typeof QuickFind;
    Notifications: typeof Notifications;
    Pagination: typeof Pagination;
    PageSizeSwitcher: typeof PageSizeSwitcher;
    /** The empty state in place of what shows the records while the provider has none. */
    EmptyRecords: typeof EmptyRecords;
    /** The button that opens the column editor, and the editor itself. */
    EditColumns: typeof EditColumns;
    /** The parts as plain UI, with no control behind them. */
    Ui: IDatasetControlUi;
    Classes: IDatasetControlClasses;
}

/** Loads the provider through `onLoad`, holds every part inside it and draws what fails in their place. */
export type IDatasetControlNamespace = typeof Root & IDatasetControlParts;

export const DatasetControl: IDatasetControlNamespace = Object.assign(Root, {
    Header,
    Body,
    Footer,
    ViewSwitcher,
    Ribbon,
    QuickFind,
    Notifications,
    Pagination,
    PageSizeSwitcher,
    EmptyRecords,
    EditColumns,
    Ui: DatasetControlUi,
    Classes: {
        ViewSwitcher: DatasetControlViewSwitcher,
        QuickFind: DatasetControlQuickFind,
        Notifications: DatasetControlNotifications,
        Pagination: DatasetControlPagination,
        PageSizeSwitcher: DatasetControlPageSizeSwitcher,
        EditColumns: DatasetControlEditColumns,
        EditColumnsSession: DatasetControlEditColumnsSession,
    },
});
