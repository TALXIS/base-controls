import { RangeSelectionModule } from "@ag-grid-enterprise/range-selection";
import { AgGridReactProps } from "@ag-grid-community/react";
import { IRecord } from "@talxis/client-libraries";
import { IGridModule } from "../interfaces";

/**
 * The cell-range options AG Grid takes, as a caller may set them.
 *
 * AG Grid's own names, so its documentation is the documentation. `enableRangeSelection` is not among them
 * — see {@link createCellSelectionModule}.
 */
export type IGridCellSelectionOptions = Pick<AgGridReactProps<IRecord>,
    | 'suppressMultiRangeSelection'
    | 'enableRangeHandle'
    | 'enableFillHandle'
    | 'fillHandleDirection'
    | 'suppressClearOnFillReduction'>;

/**
 * Builds the module that lets cells be highlighted by dragging across them.
 *
 * There is no option to turn it off: registering the module is what says the grid highlights cells at all,
 * the same way the selection module is what says its rows can be selected. What is highlighted is also
 * what {@link createClipboardModule} copies, in preference to anything else.
 *
 * The fill handle is off unless asked for. It writes values through the rows, so whether a grid wants that
 * is a question about its own cells rather than about highlighting.
 *
 * @example
 * ```tsx
 * <Grid.Root modules={{
 *     rowModel: createClientSideRowModelModule(),
 *     cellSelection: createCellSelectionModule(),
 *     clipboard: createClipboardModule(),
 * }} />
 * ```
 */
export const createCellSelectionModule = (options?: IGridCellSelectionOptions): IGridModule => ({
    agGridModules: [RangeSelectionModule],
    getInitialComponentProps: () => ({ enableRangeSelection: true, ...options }),
});
