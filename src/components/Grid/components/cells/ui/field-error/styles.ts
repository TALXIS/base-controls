import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getFieldErrorStyles = (theme: ITheme) => mergeStyleSets({
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
        //first, whichever edge the column reads from
        order: 0,
    },
    icon: {
        color: theme.semanticColors.errorText,
        fontSize: theme.fonts.small.fontSize,
        cursor: 'default',
    },
});
