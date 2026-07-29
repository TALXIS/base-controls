import { mergeStyleSets, ITheme } from "@fluentui/react";

export const getSkeletonStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
        },
        notifications: {
            display: 'flex',
        },
        notification: {
            width: '100%',
        },
        ribbon: {
            overflow: 'hidden',
            border: `1px solid ${theme.semanticColors.bodyDivider}`,
            boxShadow: theme.effects.elevation4,
            backgroundColor: theme.semanticColors.bodyBackground,
            padding: '0 8px',
        },
        tabs: {
            display: 'flex',
            gap: 12,
            padding: '0 8px',
            alignItems: 'center',
            height: 32,
        },
        tabMarker: {
            minWidth: 44,
        },
        body: {
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
        },
        section: {
            border: `1px solid ${theme.semanticColors.bodyDivider}`,
            backgroundColor: theme.semanticColors.bodyBackground,
            boxShadow: theme.effects.elevation4,
            overflow: 'hidden',
        },
        sectionHeader: {
            padding: '10px 12px',
            borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`,
            backgroundColor: theme.palette.neutralLighterAlt,
        },
        sectionContent: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
            padding: 12,
        },
        field: {
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
        },
        fieldLabel: {
            width: '45%',
        },
        fieldControl: {
            width: '100%',
        },
    });
};
