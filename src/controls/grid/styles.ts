import { IStyle, ITheme, mergeStyleSets } from "@fluentui/react";
import { CELL_CONTAINER_CLASS_NAME } from "./components/cells/ui/container/styles";

/** How tall the rows area stays when there is nothing in it. */
const EMPTY_ROWS_AREA_HEIGHT = 135;

/** Sizes the grid to its rows, up to `maxVisibleRows`, without anything having to measure it. */
const getAutoHeightStyles = (rowHeight: number, maxVisibleRows: number) => {
    return {
        //as tall as what is in it
        height: 'auto',
        //ag-grid gives this a height of 0 and has it grow into its parent
        '.ag-root-wrapper-body.ag-layout-normal': {
            height: 'auto'
        },
        //the viewport is what scrolls
        '.ag-body, .ag-body-viewport': {
            maxHeight: rowHeight * maxVisibleRows
        },
        '.ag-body-viewport': {
            //never past the cap: a min-height beats a max-height
            minHeight: Math.min(EMPTY_ROWS_AREA_HEIGHT, rowHeight * maxVisibleRows)
        }
    };
};

export const getGridStyles = (theme: ITheme, moduleStyles: IStyle[], height?: string | null, rowHeight: number = 42, maxVisibleRows: number = 15) => {
    return mergeStyleSets({
        gridRoot: [{
            //the "no records" overlay is centred over the whole grid, pinned rows included
            minHeight: 220,
            display: 'flex',
            flexDirection: 'column',
            '.ag-root-wrapper': {
                maxHeight: '100%',
                //every state the grid draws comes from these.
                '--ag-background-color': theme.semanticColors.bodyBackground,
                '--ag-foreground-color': theme.semanticColors.bodyText,
                '--ag-header-background-color': theme.semanticColors.bodyBackground,
                '--ag-border-color': theme.semanticColors.menuDivider,
                '--ag-row-border-color': theme.semanticColors.menuDivider,
                //the states are drawn as overlays below
                '--ag-row-hover-color': 'transparent',
                '--ag-input-focus-border-color': theme.semanticColors.inputFocusBorderAlt,
                '--ag-cell-horizontal-padding': 0,
                //no separator between cells and no box around the grid
                '--ag-cell-horizontal-border': 'none',
                '--ag-borders': 'none',
                '--ag-borders-critical': 'none',
                borderBottom: `1px solid ${theme.semanticColors.menuDivider}`
            },
            '.ag-body': {
                borderTop: `1px solid ${theme.semanticColors.menuDivider}`
            },
            '.ag-center-cols-container': {
                minWidth: '100%',
            },
            '.ag-header-cell': {
                paddingLeft: 0,
                paddingRight: 0
            },
            //the cell renders a control of its own.
            '.ag-cell, .ag-ltr .ag-cell, .ag-rtl .ag-cell': {
                borderRadius: 0,
                overflow: 'hidden',
                borderWidth: 0,
            },
            //AG Grid borders the focused cell itself while no range claims it
            '.ag-cell.ag-cell-focus:not(.ag-cell-range-selected):focus-within, .ag-context-menu-open .ag-cell.ag-cell-focus:not(.ag-cell-range-selected)': {
                borderWidth: 0,
            },
            //every state the grid draws on a cell is an overlay over the cell's body.
            [`.${CELL_CONTAINER_CLASS_NAME}::after`]: {
                content: '""',
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 1,
                '--talxis-cell-outline-color': theme.palette.themePrimary,
                '--talxis-cell-outline-top': '0px',
                '--talxis-cell-outline-right': '0px',
                '--talxis-cell-outline-bottom': '0px',
                '--talxis-cell-outline-left': '0px',
                boxShadow: `inset 0 var(--talxis-cell-outline-top) 0 0 var(--talxis-cell-outline-color), inset calc(-1 * var(--talxis-cell-outline-right)) 0 0 0 var(--talxis-cell-outline-color), inset 0 calc(-1 * var(--talxis-cell-outline-bottom)) 0 0 var(--talxis-cell-outline-color), inset var(--talxis-cell-outline-left) 0 0 0 var(--talxis-cell-outline-color)`,
            },
            //the grid's own text colour, whatever colour a cell's text is
            [`.ag-row-hover .${CELL_CONTAINER_CLASS_NAME}::after`]: {
                backgroundColor: `color-mix(in srgb, ${theme.semanticColors.bodyText}, transparent 92%)`,
            },
            //the focused cell is outlined in the colour of a focused input, over what the modules highlight
            [`.ag-cell.ag-cell-focus .${CELL_CONTAINER_CLASS_NAME}::after`]: {
                backgroundColor: 'transparent',
                '--talxis-cell-outline-color': theme.semanticColors.inputFocusBorderAlt,
                '--talxis-cell-outline-top': '1px',
                '--talxis-cell-outline-right': '1px',
                '--talxis-cell-outline-bottom': '1px',
                '--talxis-cell-outline-left': '1px',
            },
            '.ag-cell-wrapper:has([data-is-loading="true"])': {
                height: '100%'
            },
            '.ag-overlay-loading-wrapper': {
                backdropFilter: 'blur(1px)'
            },
            //the grid is either as tall as it was told to be, or as tall as its rows
            ...(height ? { height: height } : getAutoHeightStyles(rowHeight, maxVisibleRows))
        }, ...moduleStyles],
    })
};
