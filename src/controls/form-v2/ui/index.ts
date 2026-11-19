import { FormV2UiCell } from "./cell";
import { FormV2UiColumn } from "./column";
import { FormV2UiSection, FormV2UiSectionBody } from "./section";
import { FormV2UiSkeleton } from "./skeleton";
import { FormV2UiTab } from "./tab";
import { FormV2UiTabs } from "./tabs";

export type { IFormV2UiCellProps, IFormV2UiCellComponents } from "./cell";
export { FormV2UiCellComponents } from "./cell";
export type { IFormV2UiColumnProps, IFormV2UiColumnComponents } from "./column";
export { FormV2UiColumnComponents } from "./column";
export type { IFormV2UiSectionProps, IFormV2UiSectionBodyProps, IFormV2UiSectionBodyComponents } from "./section";
export { FormV2UiSectionBodyComponents } from "./section";
export type { IFormV2UiSkeletonProps, IFormV2UiSkeletonShimmerProps, IFormV2UiSkeletonComponents } from "./skeleton";
export { FormV2UiSkeletonComponents } from "./skeleton";
export type { IFormV2UiTabProps, IFormV2UiTabComponents } from "./tab";
export { FormV2UiTabComponents } from "./tab";
export type { IFormV2UiTabsProps, IFormV2UiTabsItem, IFormV2UiTabsRenderProps, IFormV2UiTabsComponents } from "./tabs";
export { FormV2UiTabsComponents } from "./tabs";
export type { ILayoutBreakpoints as IFormV2UiLayoutBreakpoints } from "./layout";

/** The form's parts as plain UI, with no form behind them. */
export interface IFormV2Ui {
    /** The strip of tab headers. */
    Tabs: typeof FormV2UiTabs;
    /** One tab's content. */
    Tab: typeof FormV2UiTab;
    /** A section's box: a card that can be hidden. */
    Section: typeof FormV2UiSection;
    /** A section's cells, laid out by its width. */
    SectionBody: typeof FormV2UiSectionBody;
    /** A column of sections. */
    Column: typeof FormV2UiColumn;
    /** One field with its label. */
    Cell: typeof FormV2UiCell;
    /** The placeholder shown while the form loads. */
    Skeleton: typeof FormV2UiSkeleton;
}

export const FormV2Ui: IFormV2Ui = {
    Tabs: FormV2UiTabs,
    Tab: FormV2UiTab,
    Section: FormV2UiSection,
    SectionBody: FormV2UiSectionBody,
    Column: FormV2UiColumn,
    Cell: FormV2UiCell,
    Skeleton: FormV2UiSkeleton,
};
