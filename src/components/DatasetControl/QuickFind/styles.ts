import { mergeStyleSets } from "@fluentui/react"

export const getQuickFindStyles = () => {
    return mergeStyleSets({
        quickFindRoot: {
            marginLeft: 'auto'
        },
        fieldGroup: {
            width: 230
        }
    })
}