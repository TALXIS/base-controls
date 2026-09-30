import { IGroupingUiExpandCollapseComponents } from "../ui";

/** The replaceable pieces of the expansion column's header, by the part they belong to. */
export interface IGroupExpansionHeaderComponents {
    expandCollapse?: Partial<IGroupingUiExpandCollapseComponents>;
}
