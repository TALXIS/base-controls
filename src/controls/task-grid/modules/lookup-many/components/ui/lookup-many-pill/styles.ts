import { ITheme, mergeStyleSets } from "@fluentui/react";
import { getOptionTagColors } from "@ui";

//as the grid draws the options of a choice column
export const getLookupManyPillStyles = (theme: ITheme, color: string) => {
    const tag = getOptionTagColors(color, theme.semanticColors.bodyBackground, theme.semanticColors.bodyText);
    return mergeStyleSets({
        pill: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
            height: 24,
            maxWidth: 200,
            minWidth: 0,
            paddingLeft: 6,
            paddingRight: 6,
            boxSizing: 'border-box',
            overflow: 'hidden',
            borderRadius: theme.effects.roundedCorner4,
            border: `1px solid ${tag.border}`,
            backgroundColor: tag.background,
            color: tag.text,
            fontSize: theme.fonts.small.fontSize,
            fontWeight: 600,
        },
        label: {
            lineHeight: '1.2',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
        link: {
            minWidth: 0,
            overflow: 'hidden',
            color: 'inherit',
            fontWeight: 600,
            '&:hover, &:active, &:focus, &:active:hover': { color: 'inherit' },
        },
        remove: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            width: 16,
            height: 16,
            marginRight: -2,
            borderRadius: theme.effects.roundedCorner2,
            cursor: 'pointer',
            color: tag.text,
            ':hover': {
                backgroundColor: tag.border,
            },
        },
        removeIcon: {
            fontSize: 10,
        },
    });
};
