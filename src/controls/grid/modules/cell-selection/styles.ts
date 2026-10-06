import { IStyle } from "@fluentui/react";
import { ITheme } from "@theme";
import { CELL_CONTAINER_CLASS_NAME } from "../../components/cells/ui/container/styles";

export const getGridCellSelectionStyles = (theme: ITheme): IStyle => ({
    //drawn as an overlay over the cells
    '.ag-root-wrapper': {
        '--ag-range-selection-background-color': 'transparent',
        '--ag-range-selection-border-color': theme.palette.themePrimary,
        '--ag-range-selection-highlight-color': `color-mix(in srgb, ${theme.palette.themePrimary}, transparent 70%)`,
    },
    //`ag-cell-range-selected` as well as the edge class
    [`.ag-cell-range-selected:not(.ag-cell-range-single-cell).ag-cell-range-top .${CELL_CONTAINER_CLASS_NAME}::after`]: { '--talxis-cell-outline-top': '1px' },
    [`.ag-cell-range-selected:not(.ag-cell-range-single-cell).ag-cell-range-right .${CELL_CONTAINER_CLASS_NAME}::after`]: { '--talxis-cell-outline-right': '1px' },
    [`.ag-cell-range-selected:not(.ag-cell-range-single-cell).ag-cell-range-bottom .${CELL_CONTAINER_CLASS_NAME}::after`]: { '--talxis-cell-outline-bottom': '1px' },
    [`.ag-cell-range-selected:not(.ag-cell-range-single-cell).ag-cell-range-left .${CELL_CONTAINER_CLASS_NAME}::after`]: { '--talxis-cell-outline-left': '1px' },
    //a range of one cell is outlined the whole way round.
    [`.ag-cell-range-single-cell .${CELL_CONTAINER_CLASS_NAME}::after`]: {
        '--talxis-cell-outline-top': '1px',
        '--talxis-cell-outline-right': '1px',
        '--talxis-cell-outline-bottom': '1px',
        '--talxis-cell-outline-left': '1px',
    },
    [`.ag-cell-range-selected:not(.ag-cell-focus) .${CELL_CONTAINER_CLASS_NAME}::after, .ag-cell-range-single-cell .${CELL_CONTAINER_CLASS_NAME}::after`]: {
        backgroundColor: `color-mix(in srgb, ${theme.palette.themePrimary}, transparent 85%)`,
    },
});
