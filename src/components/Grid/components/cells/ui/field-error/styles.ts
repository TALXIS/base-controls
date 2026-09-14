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
        //outermost, on the edge the column does not read from: the mark belongs to the cell rather than to
        //the value, so it sits past everything the cell draws
        order: alignment === 'right' ? 2 : undefined
    },
    icon: {
        color: theme.semanticColors.errorText,
        fontSize: theme.fonts.small.fontSize,
        cursor: 'default',
    },
});
