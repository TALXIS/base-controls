import { IStyle } from "@fluentui/react";
import { ITheme } from "@theme";
import { DROP_TARGET_ROW_CLASS, INACTIVE_ROW_CLASS, UNMATCHED_PARENT_ROW_CLASS } from "./constants";

export const getTaskTreeStyles = (theme: ITheme): IStyle => ({
    //AG Grid sizes an auto-height cell to its content, so a taller neighbour leaves it at the top
    '.ag-cell-auto-height': {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    [`.${INACTIVE_ROW_CLASS}`]: {
        '[class^="notificationsRoot"]': {
            display: 'none',
        },
        '::after': {
            display: 'block',
            content: "''",
            width: '100%',
            height: '100%',
            backgroundColor: theme.semanticColors.disabledBackground,
            opacity: 0.3,
            pointerEvents: 'none',
            position: 'absolute',
            top: 0,
        },
    },
    [`.${UNMATCHED_PARENT_ROW_CLASS} .ag-cell [class^="valueContainer"]`]: {
        fontStyle: 'italic !important',
        '>span': {
            marginRight: 1,
        },
    },
});

export const getTaskTreeReorderingStyles = (theme: ITheme): IStyle => ({
    [`.${DROP_TARGET_ROW_CLASS}`]: {
        outline: `1px solid ${theme.palette.themePrimary}`,
        outlineOffset: -1,
        //the cells carry their own background, and a pinned side sits above the row
        '> .ag-grid-pinned-left-cells::after, > .ag-grid-scrolling-cells::after, > .ag-grid-pinned-right-cells::after': {
            content: "''",
            position: 'absolute',
            inset: 0,
            height: 'auto',
            borderRadius: 0,
            margin: 0,
            backgroundColor: theme.palette.themePrimary,
            opacity: 0.12,
            pointerEvents: 'none',
        },
    },
    //AG Grid animates a moved row for 0.4s, which trails the pointer during a drag
    '.ag-row': {
        transitionDuration: '0.12s',
    },
});
