import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getCardStyles = (theme: ITheme) => mergeStyleSets({
    card: {
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 8,
        border: `1px solid ${theme.palette.neutralLight}`,
        backgroundColor: theme.semanticColors.bodyBackground,
        color: theme.semanticColors.bodyText,
        boxShadow: theme.effects.elevation4,
        overflow: 'hidden',
        opacity: 1,
        transform: 'translateY(0)',
        transition: 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease-out 0.01s',
        '@starting-style': {
            opacity: 0,
            transform: 'translateY(-16px)',
        },
    },
});
