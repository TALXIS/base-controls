import { Root } from './components/adapters/root';
import { Header } from './components/adapters/header';
import { Body } from './components/adapters/body';
import { Footer } from './components/adapters/footer';
import { ViewSwitcher } from './components/adapters/view-switcher';
import { Ribbon } from './components/adapters/ribbon';
import { QuickFind } from './components/adapters/quick-find';
import { Notifications } from './components/adapters/notifications';
import { Pagination } from './components/adapters/pagination';
import { PageSizeSwitcher } from './components/adapters/page-size-switcher';
import { EmptyRecords } from './components/adapters/empty-records';
import { EditColumns } from './components/adapters/edit-columns';
import { DatasetControlUi, IDatasetControlUi } from './components/ui';

/** The parts of the control, attached to the control itself. */
export interface IDatasetControlParts {
    /** The row above the records; `Header.Start` and `Header.End` are its left and right regions. */
    Header: typeof Header;
    /** What fills the height the header and footer leave, holding what shows the records. */
    Body: typeof Body;
    /** The row below the records; `Footer.Start` and `Footer.End` are its left and right regions. */
    Footer: typeof Footer;
    /** Switches between the views its `onLoad` returns. */
    ViewSwitcher: typeof ViewSwitcher;
    /** The shared `Ribbon`, loaded again whenever the selected records change. */
    Ribbon: typeof Ribbon;
    /** Searches the records. */
    QuickFind: typeof QuickFind;
    /** What the control has to tell the user about its records. */
    Notifications: typeof Notifications;
    /** Moves between the pages. */
    Pagination: typeof Pagination;
    /** Picks how many records a page holds, and shows which of them it shows. */
    PageSizeSwitcher: typeof PageSizeSwitcher;
    /** The empty state in place of what shows the records while the provider has none. */
    EmptyRecords: typeof EmptyRecords;
    /** The button that opens the column editor, and the editor itself. */
    EditColumns: typeof EditColumns;
    /** The parts as plain UI, with no control behind them. */
    Ui: IDatasetControlUi;
}

/** Loads the provider through `onLoad`, holds every part inside it and draws what fails in their place. */
export type IDatasetControlNamespace = typeof Root & IDatasetControlParts;

/** Loads the provider through `onLoad` and holds every part of the control. */
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
});
