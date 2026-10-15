import { IStyle } from "@fluentui/react";
import { ITheme } from "@theme";
import { LOCKED_RECORD_ROW_CLASS } from "./constants";

export const getGridEditingStyles = (theme: ITheme): IStyle => ({
    //AG Grid gives every child of a cell's wrapper the height of a row.
    '.ag-cell.ag-cell-inline-editing .ag-cell-wrapper > *': {
        height: '100%',
    },
    //above the pinned cells' wrapper, which AG Grid stacks at 2 over the row
    [`.ag-row.${LOCKED_RECORD_ROW_CLASS}::after`]: {
        content: '""',
        position: 'absolute',
        inset: 0,
        zIndex: 3,
        pointerEvents: 'none',
        backgroundColor: theme.semanticColors.disabledBackground,
        opacity: 0.3,
    },
});
