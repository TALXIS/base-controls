import { ITheme, mergeStyleSets } from '@fluentui/react';

export const getMapClusterCardStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            minWidth: 240,
            maxWidth: 340,
            color: theme.semanticColors.bodyText
        },
        //the popup owns the scrolling, so the header pins itself to the top of it - a member's card can be
        //tall, and the way back to the list must never scroll out of reach
        header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            position: 'sticky',
            top: 0,
            zIndex: 1,
            paddingBottom: 6,
            marginBottom: 6,
            backgroundColor: theme.semanticColors.bodyBackground,
            borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`
        },
        title: {
            flexGrow: 1,
            fontWeight: 600,
            fontSize: theme.fonts.mediumPlus.fontSize,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        },
        more: {
            display: 'block',
            paddingTop: 8,
            fontSize: theme.fonts.small.fontSize,
            color: theme.semanticColors.bodySubtext
        }
    });
};
