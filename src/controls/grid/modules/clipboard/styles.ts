import { IStyle } from "@fluentui/react";
import { ITheme } from "@theme";
import { CELL_CONTAINER_CLASS_NAME } from "../../components/cells/ui/container/styles";

export const getGridClipboardStyles = (theme: ITheme): IStyle => ({
    //the flash after a copy or a value change
    [`.ag-cell.ag-cell-highlight .${CELL_CONTAINER_CLASS_NAME}::after, .ag-cell.ag-cell-data-changed .${CELL_CONTAINER_CLASS_NAME}::after`]: {
        backgroundColor: `color-mix(in srgb, ${theme.palette.themePrimary}, transparent 55%)`,
    },
});
