import { IStyle } from "@fluentui/react";
import { ITheme } from "@theme";
import { LOCKED_RECORD_ROW_CLASS } from "./constants";

export const getGridEditingStyles = (theme: ITheme): IStyle => ({
    //`!important` beats AG Grid's more specific focus border selector
    '.ag-cell.ag-cell-inline-editing': {
        borderWidth: '0 !important',
    },
    //AG Grid gives every child of a cell's wrapper the height of a row.
    '.ag-cell.ag-cell-inline-editing .ag-cell-wrapper > *': {
        height: '100%',
    },
    //a record locked as a whole is dimmed as one row, over its cells
    [`.ag-row.${LOCKED_RECORD_ROW_CLASS}::after`]: {
        content: '""',
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        backgroundColor: theme.semanticColors.disabledBackground,
        opacity: 0.3,
    },
});
