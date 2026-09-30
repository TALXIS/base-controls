import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getGroupingUiToggleStyles = (theme: ITheme) => mergeStyleSets({
    container: {
        display: 'flex',
        alignItems: 'center',
        //ahead of the value whatever order the column's alignment gives the two
        order: 0,
        //only the room the button needs
        flex: '0 0 auto',
    },
    button: {
        minWidth: 0,
        width: 28,
        height: '100%',
        padding: 0,
    },
    icon: {
        margin: 0,
        fontSize: 12,
        //the palette steps from a mid grey straight to the text colour
        color: theme.palette.neutralPrimaryAlt,
    },
    iconHovered: {
        color: theme.palette.neutralPrimary,
    },
    iconPressed: {
        color: theme.palette.neutralDark,
    },
});
