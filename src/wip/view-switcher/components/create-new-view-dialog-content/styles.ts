import { mergeStyleSets } from "@fluentui/react"

export const getCreateNewViewDialogStyles = () => {
    return mergeStyleSets({
        contentWrapper: {
            paddingBottom: 15
        }
    })
}