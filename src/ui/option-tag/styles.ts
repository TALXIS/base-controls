import { mergeStyleSets } from "@fluentui/react";
import { ITheme } from "@theme";
import { getOptionTagColors } from "./colors";

/** How tall a tag grows, however much room it is given. */
const MAX_HEIGHT = 22;
/** What stays clear above and below a tag, so it never sits against the edges of what holds it. */
const VERTICAL_PADDING = 2;

export const getOptionTagStyles = (theme: ITheme, color: string) => {
    const tag = getOptionTagColors(color, theme.semanticColors.bodyBackground, theme.semanticColors.bodyText);
    return mergeStyleSets({
        optionTag: {
            display: 'flex',
            alignItems: 'center',
            alignSelf: 'center',
            boxSizing: 'border-box',
            //a holder with no set height leaves the cap unresolved, so the tag keeps its own
            height: MAX_HEIGHT,
            maxHeight: `calc(100% - ${VERTICAL_PADDING * 2}px)`,
            gap: 6,
            borderRadius: theme.effects.roundedCorner6,
            paddingLeft: 8,
            paddingRight: 8,
            overflow: 'hidden',
            flexGrow: 1,
            maxWidth: 'fit-content',
            fontSize: theme.fonts.small.fontSize,
            fontWeight: 600,
            //a tint of the option's colour rather than the colour itself, which is how Fluent draws a tag
            backgroundColor: tag.background,
            //an edge drawn inside, so it adds nothing to the tag's size
            boxShadow: `inset 0 0 0 1px ${tag.border}`,
            color: tag.text,
        },
        dot: {
            flexShrink: 0,
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: color,
        },
        label: {
            //a cell centres its text by line height, which would draw the label taller than the tag
            lineHeight: '1.2',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
    });
};
