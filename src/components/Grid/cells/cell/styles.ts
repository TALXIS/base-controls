import { ITheme, mergeStyleSets } from "@fluentui/react";
import { IColumn } from "@talxis/client-libraries";

export const getCellStyles = () => {
    return mergeStyleSets({
        cellRoot: {
            height: '100% !important',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        checkbox: {
            marginRight: 0.5
        },
        checkBoxContainer: {
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
        }
    })
}

export const getInnerCellStyles = (isEditing: boolean, theme: ITheme, columnAlignment: IColumn['alignment']) => {
    return mergeStyleSets({
        innerCellRoot: {
            flex: 1,
            display: 'flex',
            overflow: 'hidden',
            alignItems: 'center',
            height: '100%',
            marginLeft: isEditing ? - 1 : undefined,
            marginRight: isEditing ? - 1 : undefined,
        },

        shimmerWrapper: {
            height: 10
        },
        shimmerRoot: {
            width: '100%',
            paddingLeft: 10,
            paddingRight: 10
        },
        errorIconRoot: {
            color: `${theme.semanticColors.errorIcon} !important`
        },
        uneditableIconRoot: {
            color: `${theme.semanticColors.bodyText} !important`
        }
    })
}

