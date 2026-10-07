import { IStyle, mergeStyleSets } from "@fluentui/react";
import { FIELD_ERROR_OUTLINE_CLASS_NAME } from "./components/cells/ui/field-error/styles";

/** How tall the rows area stays when there is nothing in it. */
const EMPTY_ROWS_AREA_HEIGHT = 135;

/** Sizes the grid to its rows, up to `maxVisibleRows`, through the theme's auto height limits. */
const getAutoHeightStyles = (rowHeight: number, maxVisibleRows: number) => {
    return {
        //as tall as what is in it
        height: 'auto',
        '--ag-auto-height-max-body-height': `${rowHeight * maxVisibleRows}px`,
        '--ag-auto-height-min-body-height': `${Math.min(EMPTY_ROWS_AREA_HEIGHT, rowHeight * maxVisibleRows)}px`,
    };
};

export const getGridStyles = (moduleStyles: IStyle[], height?: string | null, rowHeight: number = 42, maxVisibleRows: number = 15) => {
    return mergeStyleSets({
        gridRoot: [{
            //the "no records" overlay is centred over the whole grid, pinned rows included
            minHeight: 220,
            display: 'flex',
            flexDirection: 'column',
            '.ag-root-wrapper': {
                maxHeight: '100%',
            },
            //AG Grid's row states are drawn over the cells, which paint their own backgrounds
            '.ag-grid-pinned-left-cells::before, .ag-grid-scrolling-cells::before, .ag-grid-pinned-right-cells::before': {
                zIndex: 1,
            },
            //the focused cell shows its own colours, as AG Grid does for the editing one
            '.ag-cell-focus': {
                zIndex: 1,
            },
            //the overlay below stops short of the cell's border
            '.ag-cell-range-selected:not(.ag-cell-focus)': {
                borderColor: 'var(--ag-range-selection-background-color)',
            },
            //over the cell's content, which can paint a background of its own
            '.ag-cell-range-selected:not(.ag-cell-focus)::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                backgroundColor: 'var(--ag-range-selection-background-color)',
            },
            //an invalid cell's outline stands in for the focus, range and editing borders
            [`.ag-cell:has(.${FIELD_ERROR_OUTLINE_CLASS_NAME})`]: {
                '--ag-range-selection-border-color': 'transparent',
                '--ag-cell-editing-border': 'solid 1px transparent',
            },
            //the cell renders a control of its own
            '.ag-cell': {
                overflow: 'hidden',
            },
            '.ag-cell-wrapper:has([data-is-loading="true"])': {
                height: '100%'
            },
            //the grid is either as tall as it was told to be, or as tall as its rows
            ...(height ? { height: height } : getAutoHeightStyles(rowHeight, maxVisibleRows))
        }, ...moduleStyles],
    })
};
