import { ITheme, mergeStyleSets } from '@fluentui/react';

export const getTaskTooltipStyles = (theme: ITheme, statusColor?: string) => {
    return mergeStyleSets({
        root: {
            padding: '12px 16px',
            minWidth: 240,
            maxWidth: 320,
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 10,
            paddingBottom: 10,
            borderBottom: `1px solid ${theme.palette.neutralLight}`,
        },
        statusDot: {
            width: 8,
            height: 8,
            borderRadius: '50%',
            flexShrink: 0,
            backgroundColor: statusColor ?? theme.palette.themePrimary,
        },
        title: {
            fontWeight: 600,
            fontSize: 13,
            color: theme.semanticColors.bodyText,
            lineHeight: '18px',
            wordBreak: 'break-word',
        },
        rows: {
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
        },
        row: {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
        },
        icon: {
            color: theme.palette.neutralSecondary,
            flexShrink: 0,
            width: 14,
            fontSize: 12,
            textAlign: 'center',
        },
        label: {
            color: theme.palette.neutralSecondary,
            width: 58,
            flexShrink: 0,
        },
        value: {
            color: theme.semanticColors.bodyText,
            fontWeight: 500,
        },
        durationBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            backgroundColor: theme.palette.themeLighterAlt,
            color: theme.palette.themeDark,
            border: `1px solid ${theme.palette.themeLight}`,
            borderRadius: 10,
            padding: '1px 8px',
            fontSize: 11,
            fontWeight: 600,
        },
    });
};
