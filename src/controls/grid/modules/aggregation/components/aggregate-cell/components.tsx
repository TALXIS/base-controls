import { ICellRendererComponents } from "../../../../components/cells/cell-renderer/components";

/** The replaceable pieces of a column's cell in a group's row, by the part they belong to. */
export interface IAggregateCellComponents extends Pick<ICellRendererComponents, 'container' | 'loading' | 'control' | 'columnControl' | 'commands'> { }
