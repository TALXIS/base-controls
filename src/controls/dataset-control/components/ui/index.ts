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
import { QuickFind, QuickFindCallout } from './quick-find';
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
export type { IQuickFindUiProps, IQuickFindUiComponents, IQuickFindUiLabels, IQuickFindCalloutProps, IQuickFindCalloutComponents, IQuickFindCalloutColumnProps } from './quick-find';
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
    Container: typeof Container;
    Skeleton: typeof Skeleton;
    Header: typeof Header;
    HeaderStart: typeof HeaderStart;
    HeaderEnd: typeof HeaderEnd;
    Body: typeof Body;
    Footer: typeof Footer;
    FooterStart: typeof FooterStart;
    FooterEnd: typeof FooterEnd;
    ViewSwitcher: typeof ViewSwitcher;
    QuickFind: typeof QuickFind;
    QuickFindCallout: typeof QuickFindCallout;
    Pagination: typeof Pagination;
    PageSizeSwitcher: typeof PageSizeSwitcher;
    EmptyRecords: typeof EmptyRecords;
    EditColumnsButton: typeof EditColumnsButton;
    EditColumnsPanel: typeof EditColumnsPanel;
    EditColumnsSelector: typeof EditColumnsSelector;
    EditColumnsScopeSelector: typeof EditColumnsScopeSelector;
    EditColumnsColumnSelector: typeof EditColumnsColumnSelector;
    EditColumnsColumnList: typeof EditColumnsColumnList;
    EditColumnsColumn: typeof EditColumnsColumn;
}

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
