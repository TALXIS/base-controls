import { ITheme, mergeStyleSets } from '@fluentui/react';

/** Width of the box. Wide enough for an address, narrow enough to leave the map usable. */
const SEARCH_WIDTH = 300;

export const getMapSearchBoxStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            width: SEARCH_WIDTH,
            maxWidth: '60vw'
        },
        fieldGroup: {
            borderRadius: theme.effects.roundedCorner4,
            boxShadow: theme.effects.elevation8,
            backgroundColor: theme.semanticColors.bodyBackground
        },
        suggestions: {
            marginTop: 4,
            borderRadius: theme.effects.roundedCorner4,
            boxShadow: theme.effects.elevation8,
            backgroundColor: theme.semanticColors.bodyBackground,
            overflow: 'hidden'
        },
        suggestion: {
            display: 'block',
            width: '100%',
            textAlign: 'left',
            border: 'none',
            background: 'transparent',
            color: theme.semanticColors.bodyText,
            font: 'inherit',
            fontSize: theme.fonts.small.fontSize,
            padding: '6px 10px',
            cursor: 'pointer',
            ':hover': {
                backgroundColor: theme.semanticColors.listItemBackgroundHovered
            },
            ':focus-visible': {
                outline: `1px solid ${theme.semanticColors.focusBorder}`,
                outlineOffset: -1
            }
        },
        hint: {
            display: 'block',
            padding: '6px 10px',
            fontSize: theme.fonts.small.fontSize,
            color: theme.semanticColors.bodySubtext
        }
    });
};
