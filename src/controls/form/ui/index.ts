import { FormUiCell } from "./cell";
import { FormUiColumn } from "./column";
import { FormUiSection } from "./section";
import { FormUiSkeleton } from "./skeleton";
import { FormUiTab } from "./tab";
import { FormUiTabs } from "./tabs";

export * from "./cell";
export * from "./column";
export * from "./section";
export * from "./skeleton";
export * from "./tab";
export * from "./tabs";

/** The form's parts as plain UI, with no record behind them. */
export interface IFormUi {
    /** The tab strip. */
    Tabs: typeof FormUiTabs;
    /** One tab's content. */
    Tab: typeof FormUiTab;
    /** A titled group of columns. */
    Section: typeof FormUiSection;
    /** A column of cells. */
    Column: typeof FormUiColumn;
    /** One field with its label. */
    Cell: typeof FormUiCell;
    /** The placeholder shown while the form loads. */
    Skeleton: typeof FormUiSkeleton;
}

export const FormUi: IFormUi = {
    Tabs: FormUiTabs,
    Tab: FormUiTab,
    Section: FormUiSection,
    Column: FormUiColumn,
    Cell: FormUiCell,
    Skeleton: FormUiSkeleton,
};
