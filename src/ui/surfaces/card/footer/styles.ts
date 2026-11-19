import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getCardFooterStyles = (theme: ITheme) => mergeStyleSets({
    cardFooter: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
        padding: '12px 16px',
        borderTop: `1px solid ${theme.semanticColors.bodyDivider}`,
    },
});
