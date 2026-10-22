import { ITheme, mergeStyleSets } from "@fluentui/react";

//as the grid's own value renderer
const PADDING = 9;

export const getChecklistProgressStyles = (theme: ITheme) => mergeStyleSets({
    root: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        height: '100%',
        paddingLeft: PADDING,
        paddingRight: PADDING,
        color: theme.semanticColors.bodyText,
    },
    icon: {
        fontSize: 14,
        color: theme.semanticColors.bodySubtext,
    },
    completedIcon: {
        fontSize: 14,
        color: theme.semanticColors.successIcon,
    },
});
