import { ClipboardModule } from "@ag-grid-enterprise/clipboard";
import { AgGridReactProps } from "@ag-grid-community/react";
import { IRecord } from "@talxis/client-libraries";
import { IGridClipboardModule } from "../interfaces";

/** The clipboard options AG Grid takes, as a caller may set them. */
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
 * {@link createCellSelectionModule} is registered; else the
 * @example
 */
export const createClipboardModule = (options?: IGridClipboardOptions): IGridClipboardModule => ({
    agGridModules: [ClipboardModule],
    //a copy is one cell or one highlighted block, never the row selection.
    onGetInitialComponentProps: () => ({ suppressCopyRowsToClipboard: true, ...options }),
});
