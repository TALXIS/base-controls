import { mergeStyleSets } from "@fluentui/react";
import { HEADER_PART_HEIGHT } from "../layout";
import { ITheme } from "@theme";

const MIN_LABEL_WIDTH = 80;
const GROUP_MAX_HEIGHT = 216;

export const getViewSwitcherUiStyles = (theme: ITheme) => mergeStyleSets({
    //shares the free space with a ribbon, up to its name and down to the label's minimum
    viewSwitcher: {
        height: HEADER_PART_HEIGHT,
        flex: '1 1 0',
        //Fluent's own minimum would let it shrink past the label's
        minWidth: 'auto',
        maxWidth: 'max-content',
    },
    //the fixed minimum is what the view switcher gives way down to, before the header wraps
    textContainer: {
        display: 'grid',
        gridTemplateColumns: `minmax(${MIN_LABEL_WIDTH}px, max-content)`,
    },
    label: {
        fontWeight: 600,
        display: 'block',
        minWidth: 0,
        maxWidth: 240,
        //Fluent's 100% line height is shorter than the glyphs, which the overflow would clip
        lineHeight: 'normal',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    menu: {
        selectors: {
            '.ms-ContextualMenu-list .ms-ContextualMenu-list': {
                maxHeight: GROUP_MAX_HEIGHT,
                overflowY: 'auto',
                scrollbarWidth: 'thin',
            },
        },
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
