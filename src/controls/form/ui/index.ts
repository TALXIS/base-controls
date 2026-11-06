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

export interface IFormUi {
    Tabs: typeof FormUiTabs;
    Tab: typeof FormUiTab;
    Section: typeof FormUiSection;
    Column: typeof FormUiColumn;
    Cell: typeof FormUiCell;
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
