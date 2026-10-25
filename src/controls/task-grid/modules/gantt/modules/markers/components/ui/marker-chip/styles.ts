import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getMarkerChipStyles = (theme: ITheme, color: string) => mergeStyleSets({
    chip: {
        padding: '4px 10px',
        fontSize: theme.fonts.small.fontSize,
        lineHeight: '14px',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        color: theme.palette.white,
        backgroundColor: color,
        boxShadow: theme.effects.elevation8,
    },
    milestone: {
        width: 18,
        height: 18,
        marginLeft: -9,
        marginBottom: 4,
        backgroundColor: color,
        transform: 'rotate(45deg)',
        boxShadow: theme.effects.elevation8,
    },
});
