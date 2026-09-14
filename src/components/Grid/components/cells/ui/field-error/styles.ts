import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getFieldErrorStyles = (theme: ITheme) => mergeStyleSets({
    outline: {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        boxShadow: `inset 0 0 0 1px ${theme.semanticColors.errorText}`,
    },
    fieldErrorRoot: {
        display: 'flex',
        alignItems: 'center',
        //last, whichever way the cell is aligned: the mark belongs to the cell rather than to the value
        order: 2,
        paddingRight: 4,
        paddingLeft: 4,
    },
    icon: {
        color: theme.semanticColors.errorText,
        fontSize: theme.fonts.small.fontSize,
        cursor: 'default',
    },
});
