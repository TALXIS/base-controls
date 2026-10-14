import { Container } from './container';
import { Skeleton } from './skeleton';
import { Header } from './header';
import { HeaderStart } from './header-start';
import { HeaderEnd } from './header-end';
import { Body } from './body';
import { Footer } from './footer';
import { FooterStart } from './footer-start';
import { FooterEnd } from './footer-end';
import { ViewSwitcher } from './view-switcher';
import { QuickFind, QuickFindCallout, QuickFindCompactButton } from './quick-find';
import { Pagination } from './pagination';
import { PageSizeSwitcher } from './page-size-switcher';
import { EmptyRecords } from './empty-records';
import { EditColumnsButton } from './edit-columns-button';
import { EditColumnsPanel } from './edit-columns-panel';
import { EditColumnsSelector } from './edit-columns-selector';
import { EditColumnsScopeSelector } from './edit-columns-scope-selector';
import { EditColumnsColumnSelector } from './edit-columns-column-selector';
import { EditColumnsColumnList, EditColumnsColumn } from './edit-columns-column-list';

export type { IContainerUiProps, IContainerUiComponents } from './container';
export type { ISkeletonUiProps, ISkeletonUiComponents, ISkeletonShimmerProps } from './skeleton';
export type { IHeaderUiProps, IHeaderUiComponents } from './header';
export type { IHeaderStartUiProps, IHeaderStartUiComponents } from './header-start';
export type { IHeaderEndUiProps, IHeaderEndUiComponents } from './header-end';
export type { IBodyUiProps, IBodyUiComponents } from './body';
export type { IFooterUiProps, IFooterUiComponents } from './footer';
export type { IFooterStartUiProps, IFooterStartUiComponents } from './footer-start';
export type { IFooterEndUiProps, IFooterEndUiComponents } from './footer-end';
export type { IViewSwitcherUiProps, IViewSwitcherUiComponents } from './view-switcher';
export type { IQuickFindUiProps, IQuickFindUiComponents, IQuickFindUiLabels, IQuickFindCalloutProps, IQuickFindCalloutComponents, IQuickFindCalloutColumnProps, IQuickFindCompactButtonProps, IQuickFindCompactButtonComponents } from './quick-find';
export type { IPaginationUiProps, IPaginationUiComponents, IPaginationUiLabels } from './pagination';
export type { IPageSizeSwitcherUiProps, IPageSizeSwitcherUiComponents } from './page-size-switcher';
export type { IEmptyRecordsUiProps, IEmptyRecordsUiComponents } from './empty-records';
export type { IEditColumnsButtonUiProps, IEditColumnsButtonUiComponents } from './edit-columns-button';
export type { IEditColumnsPanelUiProps, IEditColumnsPanelUiComponents, IEditColumnsPanelFooterProps } from './edit-columns-panel';
export type { IEditColumnsSelectorUiProps, IEditColumnsSelectorUiComponents, IEditColumnsSelectorOptionProps } from './edit-columns-selector';
export type { IEditColumnsScopeSelectorUiProps } from './edit-columns-scope-selector';
export type { IEditColumnsColumnSelectorUiProps } from './edit-columns-column-selector';
export type { IEditColumnsColumnListUiProps, IEditColumnsColumnListUiComponents, IEditColumnsListColumn } from './edit-columns-column-list';

/** The dataset control's parts as plain UI, with no control behind them. */
export interface IDatasetControlUi {
    /** The control's outer box. */
    Container: typeof Container;
    /** The placeholder shown while the control loads. */
    Skeleton: typeof Skeleton;
    /** The row above the records. */
    Header: typeof Header;
    /** The header's left region. */
    HeaderStart: typeof HeaderStart;
    /** The header's right region. */
    HeaderEnd: typeof HeaderEnd;
    /** What fills the height the header and footer leave. */
    Body: typeof Body;
    /** The row below the records. */
    Footer: typeof Footer;
    /** The footer's left region. */
    FooterStart: typeof FooterStart;
    /** The footer's right region. */
    FooterEnd: typeof FooterEnd;
    /** The button that lists the views. */
    ViewSwitcher: typeof ViewSwitcher;
    /** The search field. */
    QuickFind: typeof QuickFind;
    /** The callout that explains how the search matches. */
    QuickFindCallout: typeof QuickFindCallout;
    /** The search button that stands in for the quick find while it is compact. */
    QuickFindCompactButton: typeof QuickFindCompactButton;
    /** The page buttons. */
    Pagination: typeof Pagination;
    /** The record range and the page size menu. */
    PageSizeSwitcher: typeof PageSizeSwitcher;
    /** The empty state. */
    EmptyRecords: typeof EmptyRecords;
    /** The button that opens the column editor. */
    EditColumnsButton: typeof EditColumnsButton;
    /** The panel the column editor sits in. */
    EditColumnsPanel: typeof EditColumnsPanel;
    /** The select the column editor's pickers are built on. */
    EditColumnsSelector: typeof EditColumnsSelector;
    /** The picker of the entity columns are added from. */
    EditColumnsScopeSelector: typeof EditColumnsScopeSelector;
    /** The picker of the column to add. */
    EditColumnsColumnSelector: typeof EditColumnsColumnSelector;
    /** The list of chosen columns, reordered by dragging. */
    EditColumnsColumnList: typeof EditColumnsColumnList;
    /** One chosen column in the list. */
    EditColumnsColumn: typeof EditColumnsColumn;
}

/** Every part of the control as plain UI, with no control behind it. */
export const DatasetControlUi: IDatasetControlUi = {
    Container,
    Skeleton,
    Header,
    HeaderStart,
    HeaderEnd,
    Body,
    Footer,
    FooterStart,
    FooterEnd,
    ViewSwitcher,
    QuickFind,
    QuickFindCallout,
    QuickFindCompactButton,
    Pagination,
    PageSizeSwitcher,
    EmptyRecords,
    EditColumnsButton,
    EditColumnsPanel,
    EditColumnsSelector,
    EditColumnsScopeSelector,
    EditColumnsColumnSelector,
    EditColumnsColumnList,
    EditColumnsColumn,
};
