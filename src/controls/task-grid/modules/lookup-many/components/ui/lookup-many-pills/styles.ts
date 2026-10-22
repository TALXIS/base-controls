import { ITheme, mergeStyleSets } from "@fluentui/react";
import { getOptionTagColors } from "@ui";

const GAP = 4;
//as the grid's own value renderer
const PADDING = 9;

export const getLookupManyPillsStyles = (theme: ITheme) => {
    const tag = getOptionTagColors(theme.palette.neutralSecondary, theme.semanticColors.bodyBackground, theme.semanticColors.bodyText);
    return mergeStyleSets({
        root: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: GAP,
            width: '100%',
            minWidth: 0,
            paddingLeft: PADDING,
            paddingRight: PADDING,
            boxSizing: 'border-box',
            overflow: 'hidden',
            '& > *': { flexShrink: 0 },
            //the only pill left shrinks to make room for the overflow
            '& > :first-child': { flexShrink: 1, minWidth: 0 },
        },
        measurer: {
            position: 'absolute',
            top: 0,
            left: PADDING,
            display: 'flex',
            gap: GAP,
            visibility: 'hidden',
            pointerEvents: 'none',
            '& > *': { flexShrink: 0 },
        },
        overflow: {
            display: 'inline-flex',
            alignItems: 'center',
            height: 24,
            paddingLeft: 6,
            paddingRight: 6,
            boxSizing: 'border-box',
            borderRadius: theme.effects.roundedCorner4,
            border: `1px solid ${tag.border}`,
            backgroundColor: tag.background,
            color: tag.text,
            fontSize: theme.fonts.small.fontSize,
            fontWeight: 600,
            cursor: 'default',
        },
        overflowList: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: GAP,
            maxWidth: 280,
            padding: 4,
        },
    });
};

export const LOOKUP_MANY_PILLS_GAP = GAP;
export const LOOKUP_MANY_PILLS_PADDING = PADDING;
