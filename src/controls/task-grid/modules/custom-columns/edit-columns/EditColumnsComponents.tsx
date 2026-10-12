import { IEditColumnsComponents } from "@controls/dataset-control";
import { PanelCommandBar } from "./panel-command-bar";
import { ColumnSelector } from "./column-selector";
import { ColumnOption } from "./column-option";
import { Column } from "./column";

/** The column editor's pieces with the custom-column commands wired in. */
export const CustomColumnsEditColumnsComponents: IEditColumnsComponents = {
    panel: { onRenderCommandBar: props => <PanelCommandBar {...props} /> },
    columnSelector: {
        onRenderSelector: props => <ColumnSelector {...props} />,
        onRenderOption: props => <ColumnOption {...props} />,
    },
    columnList: { onRenderColumn: props => <Column {...props} /> },
};
