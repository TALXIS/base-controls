import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getTaskGanttSplitStyles = (theme: ITheme) => mergeStyleSets({
    root: {
        flexGrow: 1,
        minHeight: 0,
    },
    //the Gantt's scrollbar, at the right edge, scrolls both
    grid: {
        '.ag-body-vertical-scroll': {
            display: 'none',
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
