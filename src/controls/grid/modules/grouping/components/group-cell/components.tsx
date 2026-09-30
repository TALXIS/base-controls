import { ICellRendererComponents } from "@controls/grid/components/cells/cell-renderer/components";
import { IGroupingUiCountComponents, IGroupingUiToggleComponents } from "../ui";

/** The replaceable pieces of a group row's grouped cell, by the part they belong to. */
export interface IGroupCellComponents extends Pick<ICellRendererComponents, 'container' | 'loading' | 'control' | 'commands'> {
    /** The chevron that opens and closes the group. */
    toggle?: Partial<IGroupingUiToggleComponents>;
    /** How many records the group holds. */
    count?: Partial<IGroupingUiCountComponents>;
}
