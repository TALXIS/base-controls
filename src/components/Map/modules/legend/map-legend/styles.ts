import { ITheme, mergeStyleSets } from '@fluentui/react';

/** Height the legend may reach before it scrolls, so it never takes the map over. */
const MAX_HEIGHT = 280;

export const getMapLegendStyles = (theme: ITheme) => {
    const surface = {
        borderRadius: theme.effects.roundedCorner4,
        boxShadow: theme.effects.elevation8,
        backgroundColor: theme.semanticColors.bodyBackground,
        color: theme.semanticColors.bodyText
    };

    return mergeStyleSets({
        root: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 8
        },
        button: surface,
        content: {
            ...surface,
            maxWidth: 260,
            maxHeight: MAX_HEIGHT,
            overflowY: 'auto',
            padding: 10,
            fontSize: theme.fonts.small.fontSize,
            //the legend brings its own markup, so it gets sane defaults rather than the page's
            'p, ul, ol, h1, h2, h3, h4, h5, h6': { margin: '4px 0' },
            'p:first-child, ul:first-child, ol:first-child, h1:first-child, h2:first-child, h3:first-child, h4:first-child, h5:first-child, h6:first-child': { marginTop: 0 },
            ul: { paddingLeft: 18 },
            table: { borderCollapse: 'collapse' },
            'td, th': { padding: '2px 6px 2px 0', textAlign: 'left' },
            img: { maxWidth: '100%' },
            a: { color: theme.palette.themePrimary }
        }
    });
};
