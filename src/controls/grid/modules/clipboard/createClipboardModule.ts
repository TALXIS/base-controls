import { ClipboardModule } from "@ag-grid-enterprise/clipboard";
import { AgGridReactProps } from "@ag-grid-community/react";
import { IRecord } from "@talxis/client-libraries";
import { IGridModule } from "../../interfaces";
import { GridClipboard } from "./GridClipboard";

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

/** Builds the module that lets what is in the grid be copied out of it. */
export const createClipboardModule = (options?: IGridClipboardOptions): IGridModule => ({
    agGridModules: [ClipboardModule],
    onRegister: ({ services }) => {
        new GridClipboard({ services, options });
    },
});
