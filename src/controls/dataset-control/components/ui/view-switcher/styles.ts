import { mergeStyleSets } from "@fluentui/react";
import { ITheme } from "@theme";

export const getViewSwitcherUiStyles = (theme: ITheme) => mergeStyleSets({
    viewSwitcher: {
        height: 44,
        minWidth: 0,
        maxWidth: '100%',
    },
    label: {
        fontWeight: 600,
        display: 'block',
        maxWidth: 240,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    selectedItem: {
        backgroundColor: theme.semanticColors.buttonBackgroundPressed,
        '.ms-ContextualMenu-itemText': {
            fontWeight: 600,
        },
    },
    menuIcon: {
        transition: 'transform 0.2s',
    },
    menuIconExpanded: {
        transform: 'rotate(180deg)',
    },
});
