import { ITheme, mergeStyleSets } from "@fluentui/react";
import { getOptionTagColors } from "@ui";

export const getLookupManyPillStyles = (theme: ITheme, color: string) => mergeStyleSets({
    pill: {
        display: 'inline-flex',
        flexGrow: 0,
        height: 22,
        maxWidth: 200,
        minWidth: 0,
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
        color: 'inherit',
        ':hover': {
            backgroundColor: getOptionTagColors(color, theme.semanticColors.bodyBackground, theme.semanticColors.bodyText).border,
        },
    },
    removeIcon: {
        fontSize: 10,
    },
});
