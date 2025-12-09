import { mergeStyleSets } from "@fluentui/react"

export const getQuickFindStyles = () => {
    return mergeStyleSets({
        textFieldRoot: {
            marginLeft: 'auto'
        },
        fieldGroup: {
            width: 230,
        }
    })
}