import { ClipboardModule } from "ag-grid-enterprise";
import { AgGridReactProps } from "ag-grid-react";
import { IRecord } from "@talxis/client-libraries";
import { IGridModule } from "../../interfaces";
import { GridClipboard } from "./GridClipboard";

/** The clipboard options AG Grid takes, as a caller may set them. */
export type IGridClipboardOptions = Pick<AgGridReactProps<IRecord>,
    | 'clipboardDelimiter'
    | 'copyHeadersToClipboard'
    | 'copyGroupHeadersToClipboard'
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

export interface IClipboardModule extends IGridModule<'clipboard'> { }

declare module "../../interfaces" {
    interface IGridModuleMap {
        /** Copying and pasting cells. */
        clipboard: GridClipboard;
    }
}

/** Builds the module that lets what is in the grid be copied out of it. */
export const createClipboardModule = (options?: IGridClipboardOptions): IClipboardModule => ({
    name: 'clipboard',
    agGridModules: [ClipboardModule],
    onLoad: ({ services }) => new GridClipboard({ services, options }),
});
