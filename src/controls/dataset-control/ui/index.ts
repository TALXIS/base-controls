import { DatasetControlUiContainer } from './container';
import { DatasetControlUiSkeleton } from './skeleton';
import { DatasetControlUiHeader } from './header';
import { DatasetControlUiHeaderStart } from './header-start';
import { DatasetControlUiHeaderEnd } from './header-end';
import { DatasetControlUiBody } from './body';
import { DatasetControlUiFooter } from './footer';
import { DatasetControlUiFooterStart } from './footer-start';
import { DatasetControlUiFooterEnd } from './footer-end';
import { DatasetControlUiViewSwitcher } from './view-switcher';
import { DatasetControlUiQuickFind, DatasetControlUiQuickFindCallout, DatasetControlUiQuickFindCompactButton } from './quick-find';
import { DatasetControlUiPagination } from './pagination';
import { DatasetControlUiPageSizeSwitcher } from './page-size-switcher';
import { DatasetControlUiEmptyState } from './empty-state';
import { DatasetControlUiEditColumnsButton } from './edit-columns-button';
import { DatasetControlUiEditColumnsPanel } from './edit-columns-panel';
import { DatasetControlUiEditColumnsSelector } from './edit-columns-selector';
import { DatasetControlUiEditColumnsScopeSelector } from './edit-columns-scope-selector';
import { DatasetControlUiEditColumnsColumnSelector } from './edit-columns-column-selector';
import { DatasetControlUiEditColumnsColumnList, DatasetControlUiEditColumnsColumn } from './edit-columns-column-list';

export type { IDatasetControlUiContainerProps, IDatasetControlUiContainerComponents } from './container';
export type { IDatasetControlUiSkeletonProps, IDatasetControlUiSkeletonComponents, IDatasetControlUiSkeletonShimmerProps } from './skeleton';
export type { IDatasetControlUiHeaderProps, IDatasetControlUiHeaderComponents } from './header';
export type { IDatasetControlUiHeaderStartProps, IDatasetControlUiHeaderStartComponents } from './header-start';
export type { IDatasetControlUiHeaderEndProps, IDatasetControlUiHeaderEndComponents } from './header-end';
export type { IDatasetControlUiBodyProps, IDatasetControlUiBodyComponents } from './body';
export type { IDatasetControlUiFooterProps, IDatasetControlUiFooterComponents } from './footer';
export type { IDatasetControlUiFooterStartProps, IDatasetControlUiFooterStartComponents } from './footer-start';
export type { IDatasetControlUiFooterEndProps, IDatasetControlUiFooterEndComponents } from './footer-end';
export type { IDatasetControlUiViewSwitcherProps, IDatasetControlUiViewSwitcherComponents } from './view-switcher';
export type { IDatasetControlUiQuickFindProps, IDatasetControlUiQuickFindComponents, IDatasetControlUiQuickFindLabels, IDatasetControlUiQuickFindCalloutProps, IDatasetControlUiQuickFindCalloutComponents, IQuickFindCalloutColumnProps, IDatasetControlUiQuickFindCompactButtonProps, IDatasetControlUiQuickFindCompactButtonComponents } from './quick-find';
export type { IDatasetControlUiPaginationProps, IDatasetControlUiPaginationComponents, IDatasetControlUiPaginationLabels } from './pagination';
export type { IDatasetControlUiPageSizeSwitcherProps, IDatasetControlUiPageSizeSwitcherComponents } from './page-size-switcher';
export type { IDatasetControlUiEmptyStateProps, IDatasetControlUiEmptyStateComponents } from './empty-state';
export type { IDatasetControlUiEditColumnsButtonProps, IDatasetControlUiEditColumnsButtonComponents } from './edit-columns-button';
export type { IDatasetControlUiEditColumnsPanelProps, IDatasetControlUiEditColumnsPanelComponents, IEditColumnsPanelFooterProps } from './edit-columns-panel';
export type { IDatasetControlUiEditColumnsSelectorProps, IDatasetControlUiEditColumnsSelectorComponents, IEditColumnsSelectorOptionProps } from './edit-columns-selector';
export type { IDatasetControlUiEditColumnsScopeSelectorProps } from './edit-columns-scope-selector';
export type { IDatasetControlUiEditColumnsColumnSelectorProps } from './edit-columns-column-selector';
export type { IDatasetControlUiEditColumnsColumnListProps, IDatasetControlUiEditColumnsColumnListComponents, IEditColumnsListColumn } from './edit-columns-column-list';

/** The dataset control's parts as plain UI, with no control behind them. */
export interface IDatasetControlUi {
    /** The control's outer box. */
    Container: typeof DatasetControlUiContainer;
    /** The placeholder shown while the control loads. */
    Skeleton: typeof DatasetControlUiSkeleton;
    /** The row above the records. */
    Header: typeof DatasetControlUiHeader;
    /** The header's left region. */
    HeaderStart: typeof DatasetControlUiHeaderStart;
    /** The header's right region. */
    HeaderEnd: typeof DatasetControlUiHeaderEnd;
    /** What fills the height the header and footer leave. */
    Body: typeof DatasetControlUiBody;
    /** The row below the records. */
    Footer: typeof DatasetControlUiFooter;
    /** The footer's left region. */
    FooterStart: typeof DatasetControlUiFooterStart;
    /** The footer's right region. */
    FooterEnd: typeof DatasetControlUiFooterEnd;
    /** The button that lists the views. */
    ViewSwitcher: typeof DatasetControlUiViewSwitcher;
    /** The search field. */
    QuickFind: typeof DatasetControlUiQuickFind;
    /** The callout that explains how the search matches. */
    QuickFindCallout: typeof DatasetControlUiQuickFindCallout;
    /** The search button that stands in for the quick find while it is compact. */
    QuickFindCompactButton: typeof DatasetControlUiQuickFindCompactButton;
    /** The page buttons. */
    Pagination: typeof DatasetControlUiPagination;
    /** The record range and the page size menu. */
    PageSizeSwitcher: typeof DatasetControlUiPageSizeSwitcher;
    /** The empty state. */
    EmptyState: typeof DatasetControlUiEmptyState;
    /** The button that opens the column editor. */
    EditColumnsButton: typeof DatasetControlUiEditColumnsButton;
    /** The panel the column editor sits in. */
    EditColumnsPanel: typeof DatasetControlUiEditColumnsPanel;
    /** The select the column editor's pickers are built on. */
    EditColumnsSelector: typeof DatasetControlUiEditColumnsSelector;
    /** The picker of the entity columns are added from. */
    EditColumnsScopeSelector: typeof DatasetControlUiEditColumnsScopeSelector;
    /** The picker of the column to add. */
    EditColumnsColumnSelector: typeof DatasetControlUiEditColumnsColumnSelector;
    /** The list of chosen columns, reordered by dragging. */
    EditColumnsColumnList: typeof DatasetControlUiEditColumnsColumnList;
    /** One chosen column in the list. */
    EditColumnsColumn: typeof DatasetControlUiEditColumnsColumn;
}

/** Every part of the control as plain UI, with no control behind it. */
export const DatasetControlUi: IDatasetControlUi = {
    Container: DatasetControlUiContainer,
    Skeleton: DatasetControlUiSkeleton,
    Header: DatasetControlUiHeader,
    HeaderStart: DatasetControlUiHeaderStart,
    HeaderEnd: DatasetControlUiHeaderEnd,
    Body: DatasetControlUiBody,
    Footer: DatasetControlUiFooter,
    FooterStart: DatasetControlUiFooterStart,
    FooterEnd: DatasetControlUiFooterEnd,
    ViewSwitcher: DatasetControlUiViewSwitcher,
    QuickFind: DatasetControlUiQuickFind,
    QuickFindCallout: DatasetControlUiQuickFindCallout,
    QuickFindCompactButton: DatasetControlUiQuickFindCompactButton,
    Pagination: DatasetControlUiPagination,
    PageSizeSwitcher: DatasetControlUiPageSizeSwitcher,
    EmptyState: DatasetControlUiEmptyState,
    EditColumnsButton: DatasetControlUiEditColumnsButton,
    EditColumnsPanel: DatasetControlUiEditColumnsPanel,
    EditColumnsSelector: DatasetControlUiEditColumnsSelector,
    EditColumnsScopeSelector: DatasetControlUiEditColumnsScopeSelector,
    EditColumnsColumnSelector: DatasetControlUiEditColumnsColumnSelector,
    EditColumnsColumnList: DatasetControlUiEditColumnsColumnList,
    EditColumnsColumn: DatasetControlUiEditColumnsColumn,
};
