import { ITheme, mergeStyleSets } from "@fluentui/react"

export const getSelectionCellStyles = (theme: ITheme) => {
    return mergeStyleSets({
        selectionCellRoot: {
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        saveSuccessBtn: {
            color: theme.semanticColors.successIcon,
        },
        saveErrorBtn: {
            color: theme.semanticColors.errorIcon,
        },
        checkBoxContainer: {
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
        },
        checkBox: {
            marginRight: 0.5
        }
    })
}