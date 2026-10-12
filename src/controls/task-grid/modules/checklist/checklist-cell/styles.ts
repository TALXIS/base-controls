import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getChecklistCellStyles = (theme: ITheme) => mergeStyleSets({
    root: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        paddingLeft: 9,
        paddingRight: 9,
        color: theme.semanticColors.bodyText,
    },
    icon: {
        fontSize: 14,
        color: theme.semanticColors.bodySubtext,
    },
    iconCompleted: {
        fontSize: 14,
        color: theme.semanticColors.successIcon,
    },
});
