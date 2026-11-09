import { ITheme, mergeStyleSets } from '@fluentui/react';

/** Height the list may reach before it scrolls. */
const MAX_HEIGHT = 300;

export const getMapClusterMemberListStyles = (theme: ITheme) => {
    return mergeStyleSets({
        list: {
            listStyle: 'none',
            margin: 0,
            padding: 0,
            maxHeight: MAX_HEIGHT,
            overflowY: 'auto'
        },
        //a row is a button, so it is reachable from the keyboard the way the pin behind it is
        member: {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            width: '100%',
            padding: '6px 4px',
            border: 'none',
            borderTop: `1px solid ${theme.semanticColors.bodyDivider}`,
            background: 'none',
            color: 'inherit',
            font: 'inherit',
            textAlign: 'left',
            cursor: 'pointer',
            ':hover': {
                backgroundColor: theme.semanticColors.listItemBackgroundHovered
            },
            ':focus-visible': {
                outline: `1px solid ${theme.palette.themePrimary}`,
                outlineOffset: -1
            }
        }
    });
};
