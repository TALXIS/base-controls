import { mergeStyleSets } from "@fluentui/react";
import { ITheme } from "@theme";
import { getOptionTagColors } from "./colors";

/** How tall a tag grows, however much room it is given. */
const MAX_HEIGHT = 24;
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
            //grows to the cap and shrinks past it: a row shorter than a tag is one the tag has to fit in
            height: `min(${MAX_HEIGHT}px, calc(100% - ${VERTICAL_PADDING * 2}px))`,
            borderRadius: theme.effects.roundedCorner4,
            paddingLeft: 6,
            paddingRight: 6,
            overflow: 'hidden',
            flexGrow: 1,
            maxWidth: 'fit-content',
            fontSize: theme.fonts.small.fontSize,
            fontWeight: 600,
            //a tint of the option's colour rather than the colour itself, which is how Fluent draws a tag
            backgroundColor: tag.background,
            border: `1px solid ${tag.border}`,
            color: tag.text,
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
