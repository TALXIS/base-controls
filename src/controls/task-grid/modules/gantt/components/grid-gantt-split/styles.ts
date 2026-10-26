import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getGridGanttSplitStyles = (theme: ITheme) => mergeStyleSets({
    root: {
        flexGrow: 1,
        minHeight: 0,
    },
    //the Gantt's scrollbar, at the right edge, scrolls both
    grid: {
        '.ag-body-vertical-scroll': {
            display: 'none',
        },
        //a bounce past either end would move the grid's rows away from the chart's
        '.ag-grid-viewport': {
            overscrollBehaviorY: 'none',
        },
    },
    handle: {
        width: 4,
        backgroundColor: theme.semanticColors.bodyDivider,
        transition: 'background-color 120ms ease',
        selectors: {
            ':hover, &[data-resize-handle-state="drag"]': {
                backgroundColor: theme.palette.themePrimary,
            },
        },
    },
});
