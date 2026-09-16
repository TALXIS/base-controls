import { mergeStyleSets } from "@fluentui/react";

/** How tall a tag grows, however much room it is given. */
const MAX_HEIGHT = 24;
/** What stays clear above and below a tag, so it never sits against the edges of what holds it. */
const VERTICAL_PADDING = 2;

export const getOptionTagStyles = (backgroundColor: string, textColor: string) => {
    return mergeStyleSets({
        optionTag: {
            display: 'flex',
            alignItems: 'center',
            alignSelf: 'center',
            boxSizing: 'border-box',
            //grows to the cap and shrinks past it: a row shorter than a tag is one the tag has to fit in
            height: `min(${MAX_HEIGHT}px, calc(100% - ${VERTICAL_PADDING * 2}px))`,
            borderRadius: 5,
            paddingLeft: 4,
            paddingRight: 4,
            overflow: 'hidden',
            flexGrow: 1,
            maxWidth: 'fit-content',
            fontWeight: 600,
            backgroundColor: backgroundColor,
            color: textColor,
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
