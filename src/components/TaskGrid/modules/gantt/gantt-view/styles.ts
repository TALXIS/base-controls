import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getGanttViewStyles = (theme: ITheme) => {
    return mergeStyleSets({
        //react-resizable-panels ships no size of its own, so the divider is nothing to grab without this
        resizeHandle: {
            width: 4,
            backgroundColor: theme.semanticColors.bodyDivider,
            cursor: 'col-resize',
            ':hover': {
                backgroundColor: theme.palette.themePrimary
            }
        },
        root: {
            height: '100%',
            '.ag-body-horizontal-scroll': {
                position: 'relative !important'
            },
            '.ag-body-viewport': {
                overscrollBehavior: 'none !important'
            },
            '.ag-body-vertical-scroll': {
                //we use gantt for vertical scrolling, so we hide the ag-grid scrollbar and sync scroll positions
                width: '0px !important',
                minWidth: '0px !important',
            },
        }
    });
};