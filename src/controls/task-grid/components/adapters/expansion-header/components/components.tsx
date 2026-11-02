import type { IGroupingUiExpandCollapseComponents } from "@controls/grid";

/** The replaceable pieces of the expand and collapse all header, by the part they belong to. */
export interface IExpansionHeaderComponents {
    expandCollapse?: Partial<IGroupingUiExpandCollapseComponents>;
}
