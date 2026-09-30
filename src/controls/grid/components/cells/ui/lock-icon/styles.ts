import { ITheme, mergeStyleSets } from "@fluentui/react";
import { IAlignment } from "@utils";

export const getCellLockIconStyles = (theme: ITheme, alignment: IAlignment) => mergeStyleSets({
    root: {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 5,
        paddingRight: 5,
        //the far edge from the value, past the commands
        order: alignment === 'right' ? -1 : 4,
    },
    icon: {
        fontSize: theme.fonts.small.fontSize,
        cursor: 'default',
    },
});
