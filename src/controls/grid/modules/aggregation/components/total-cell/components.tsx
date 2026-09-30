import { ICellRendererComponents } from "../../../../components/cells/cell-renderer/components";
import { IAggregationUiTotalValueComponents } from "../ui";

/** The replaceable pieces of a column's cell in the total row, by the part they belong to. */
export interface ITotalCellComponents extends Pick<ICellRendererComponents, 'container' | 'loading' | 'commands'> {
    /** What the total reads as. */
    totalValue?: Partial<IAggregationUiTotalValueComponents>;
}
