import { mergeStyleSets } from "@fluentui/react";
import { ITheme } from "@theme";

export const getPaginationUiStyles = (theme: ITheme, align: 'start' | 'end') => mergeStyleSets({
    //its first and last buttons line up with the footer's edges
    datasetControlPagination: {
        flex: '1 1 auto',
        minWidth: 0,
        height: 44,
        paddingLeft: 0,
        paddingRight: 0,
    },
    buttons: {
        justifyContent: align === 'end' ? 'flex-end' : 'flex-start',
    },
    currentPage: {
        '.ms-Button-label': {
            color: theme.semanticColors.bodyText,
        },
    },
});
