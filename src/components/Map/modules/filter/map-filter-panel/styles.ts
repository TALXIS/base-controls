import { ITheme, mergeStyleSets } from '@fluentui/react';

/** Height the list of facets is allowed to reach before it scrolls, so it never covers the whole map. */
const MAX_HEIGHT = 320;

export const getMapFilterPanelStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            width: 240,
            maxWidth: '60vw',
            borderRadius: theme.effects.roundedCorner4,
            boxShadow: theme.effects.elevation8,
            backgroundColor: theme.semanticColors.bodyBackground,
            color: theme.semanticColors.bodyText,
            overflow: 'hidden'
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            padding: '4px 4px 4px 10px',
            fontWeight: 600,
            fontSize: theme.fonts.small.fontSize
        },
        body: {
            maxHeight: MAX_HEIGHT,
            overflowY: 'auto',
            padding: '0 10px 8px'
        },
        facet: {
            marginTop: 8
        },
        facetLabel: {
            display: 'block',
            marginBottom: 4,
            fontSize: theme.fonts.xSmall.fontSize,
            textTransform: 'uppercase',
            letterSpacing: 0.4,
            color: theme.semanticColors.bodySubtext
        },
        option: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            padding: '2px 0'
        },
        count: {
            fontSize: theme.fonts.xSmall.fontSize,
            color: theme.semanticColors.bodySubtext
        },
        empty: {
            display: 'block',
            padding: '4px 0 8px',
            fontSize: theme.fonts.small.fontSize,
            color: theme.semanticColors.bodySubtext
        }
    });
};
