import { mergeStyleSets } from "@fluentui/react"

export const getSelectionCellStyles = () => {
    return mergeStyleSets({
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
