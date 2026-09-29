import { ITheme, mergeStyleSets } from "@fluentui/react";
import { IAlignment } from "@utils";

export const getFieldErrorStyles = (theme: ITheme, alignment: IAlignment) => mergeStyleSets({
    outline: {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        boxShadow: `inset 0 0 0 1px ${theme.semanticColors.errorText}`,
        zIndex: 2
    },
    fieldErrorRoot: {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 5,
        paddingRight: 5,
        //the far edge from the value, past the commands
        order: alignment === 'right' ? 0 : 3,
    },
    icon: {
        color: theme.semanticColors.errorText,
        fontSize: theme.fonts.small.fontSize,
        cursor: 'default',
    },
});
