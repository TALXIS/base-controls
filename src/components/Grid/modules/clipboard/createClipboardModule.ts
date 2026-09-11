import { ClipboardModule } from "@ag-grid-enterprise/clipboard";
import { AgGridReactProps } from "@ag-grid-community/react";
import { IRecord } from "@talxis/client-libraries";
import { IGridClipboardModule } from "../interfaces";

/**
 * The clipboard options AG Grid takes, as a caller may set them.
 *
 * AG Grid's own names, so its documentation is the documentation and nothing has to be kept in step as it
 * adds options. Anything not listed here is not a caller's to set.
 */
export type IGridClipboardOptions = Pick<AgGridReactProps<IRecord>,
    | 'clipboardDelimiter'
    | 'copyHeadersToClipboard'
    | 'copyGroupHeadersToClipboard'
    | 'suppressCopyRowsToClipboard'
    | 'suppressCopySingleCellRanges'
    | 'suppressCutToClipboard'
    | 'suppressClipboardPaste'
    | 'suppressClipboardApi'
    | 'suppressLastEmptyLineOnPaste'
    | 'processCellForClipboard'
    | 'processHeaderForClipboard'
    | 'processGroupHeaderForClipboard'
    | 'processCellFromClipboard'
    | 'processDataFromClipboard'
    | 'sendToClipboard'>;

/**
 * Builds the module that lets what is in the grid be copied out of it.
 *
 * What a copy takes is one of three things, in this order: the highlighted cells, where
 * {@link createCellSelectionModule} is registered; the selected rows, which this module turns off; else the
 * focused cell.
 *
 * @example
 * ```tsx
 * <Grid.Root modules={{ rowModel: createClientSideRowModelModule(), clipboard: createClipboardModule() }} />
 * ```
 */
export const createClipboardModule = (options?: IGridClipboardOptions): IGridClipboardModule => ({
    agGridModules: [ClipboardModule],
    //a copy is one cell or one highlighted block, never the row selection: a selected row is what a
    //command acts on, not what Ctrl+C reads. First, so a caller can say otherwise
    getInitialComponentProps: () => ({ suppressCopyRowsToClipboard: true, ...options }),
});
