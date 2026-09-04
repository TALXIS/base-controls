import { ClipboardModule } from "@ag-grid-enterprise/clipboard";
import { IGridClipboardModule } from "../interfaces";

/** Builds the module that lets rows be copied to the clipboard. */
export const createClipboardModule = (): IGridClipboardModule => ({
    agGridModules: [ClipboardModule],
    getInitialComponentProps: () => ({ suppressCopyRowsToClipboard: true }),
});
