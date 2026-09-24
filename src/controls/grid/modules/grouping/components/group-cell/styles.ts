import { IButtonStyles, ITheme, mergeStyleSets } from "@fluentui/react";

export const getGroupCellStyles = (theme: ITheme) => {
    const classNames = mergeStyleSets({
        commands: {
            //ahead of the value whatever order the column's alignment gives the two
            order: '0 !important',
            //only the room the buttons need, so the value keeps the rest
            flex: '0 0 auto !important',
        },
    });
    return {
        commands: classNames.commands,
        chevronStyles: {
            root: {
                minWidth: 0,
                width: 28,
                padding: 0,
            },
            icon: {
                margin: 0,
                fontSize: 12,
                //the palette steps from a mid grey straight to the text colour
                color: theme.palette.neutralPrimaryAlt
            },
            iconHovered: {
                color: theme.palette.neutralPrimary,
            },
            iconPressed: {
                color: theme.palette.neutralDark,
            },
        } as IButtonStyles,
    };
};
