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
            padding: '0 4px',
        },
        tabs: {
            display: 'flex',
            gap: 12,
            padding: '0 4px',
            alignItems: 'center',
            height: 36,
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
            borderRadius: 8,
            border: `1px solid ${theme.palette.neutralLight}`,
            backgroundColor: theme.semanticColors.bodyBackground,
            boxShadow: theme.effects.elevation4,
            overflow: 'hidden',
        },
        sectionHeader: {
            padding: '12px 16px 4px 16px',
        },
        sectionContent: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 10,
            padding: '8px 16px 16px 16px',
        },
        field: {
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
        },
        fieldLabel: {
            width: '38%',
        },
        fieldControl: {
            width: '100%',
        },
    });
};
