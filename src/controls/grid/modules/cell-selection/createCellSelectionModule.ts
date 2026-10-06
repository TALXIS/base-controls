import { RangeSelectionModule } from "@ag-grid-enterprise/range-selection";
import { AgGridReactProps } from "@ag-grid-community/react";
import { IRecord } from "@talxis/client-libraries";
import { IGridModule } from "../interfaces";
import { GridCellSelection } from "./GridCellSelection";

/** The cell-range options AG Grid takes, as a caller may set them. */
export type IGridCellSelectionOptions = Pick<AgGridReactProps<IRecord>,
    | 'suppressMultiRangeSelection'
    | 'enableRangeHandle'
    | 'enableFillHandle'
    | 'fillHandleDirection'
    | 'suppressClearOnFillReduction'>;

/** Builds the module that lets cells be highlighted by dragging across them. */
export const createCellSelectionModule = (options?: IGridCellSelectionOptions): IGridModule => ({
    agGridModules: [RangeSelectionModule],
    onRegister: ({ services }) => {
        new GridCellSelection({ services, options });
    },
});
