import { ITheme, mergeStyleSets } from '@fluentui/react';

export const getMapStatusStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 10px',
            borderRadius: theme.effects.roundedCorner4,
            boxShadow: theme.effects.elevation8,
            backgroundColor: theme.semanticColors.bodyBackground,
            color: theme.semanticColors.bodyText,
            fontSize: theme.fonts.small.fontSize,
            whiteSpace: 'nowrap'
        },
        warningIcon: {
            color: theme.semanticColors.severeWarningIcon
        }
    });
};
