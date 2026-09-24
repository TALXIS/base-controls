import { RangeSelectionModule } from "@ag-grid-enterprise/range-selection";
import { AgGridReactProps } from "@ag-grid-community/react";
import { IRecord } from "@talxis/client-libraries";
import { IGridModule } from "../interfaces";
import { GRID_MODULE_PRIORITY } from "../priorities";

/** The cell-range options AG Grid takes, as a caller may set them. */
export type IGridCellSelectionOptions = Pick<AgGridReactProps<IRecord>,
    | 'suppressMultiRangeSelection'
    | 'enableRangeHandle'
    | 'enableFillHandle'
    | 'fillHandleDirection'
    | 'suppressClearOnFillReduction'>;

/**
 * Builds the module that lets cells be highlighted by dragging across them.
 *
 * what {@link createClipboardModule} copies, in preference to anything else.
 * @example
 */
export const createCellSelectionModule = (options?: IGridCellSelectionOptions): IGridModule => ({
    agGridModules: [RangeSelectionModule],
    onRegister: services => services.get('grid').registerAgGridOptions(result => {
        result.options = { ...result.options, enableRangeSelection: true, ...options };
    }, GRID_MODULE_PRIORITY.cellSelection),
});
