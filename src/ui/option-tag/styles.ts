import { mergeStyleSets } from "@fluentui/react";
import { getTintColors, ITheme } from "@theme";

/** How tall a tag grows, however much room it is given. */
const MAX_HEIGHT = 20;
/** What stays clear above and below a tag, so it never sits against the edges of what holds it. */
const VERTICAL_PADDING = 2;

export const getOptionTagStyles = (theme: ITheme, color: string) => {
    const tag = getTintColors(color, theme);
    return mergeStyleSets({
        optionTag: {
            display: 'flex',
            alignItems: 'center',
            alignSelf: 'center',
            boxSizing: 'border-box',
            //a holder with no set height leaves the cap unresolved, so the tag keeps its own
            height: MAX_HEIGHT,
            maxHeight: `calc(100% - ${VERTICAL_PADDING * 2}px)`,
            borderRadius: theme.effects.roundedCorner4,
            paddingLeft: 7,
            paddingRight: 7,
            overflow: 'hidden',
            flexGrow: 1,
            maxWidth: 'fit-content',
            fontSize: 12,
            fontWeight: 400,
            border: '1px solid transparent',
            backgroundColor: tag.background,
            color: tag.text,
        },
        label: {
            //a cell centres its text by line height, which would draw the label taller than the tag
            lineHeight: '16px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
    });
};
