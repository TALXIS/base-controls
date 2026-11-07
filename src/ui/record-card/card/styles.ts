import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getRecordCardStyles = (theme: ITheme) => mergeStyleSets({
    card: {
        ...theme.fonts.medium,
        color: theme.semanticColors.bodyText,
        width: 280,
        boxSizing: 'border-box',
        padding: '14px 16px 12px',
    },
});
