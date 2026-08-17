import { mergeStyleSets } from "@fluentui/react"

export const getSortableItemCommandBarStyles = () => {
    return mergeStyleSets({
        commandBar: {
            height: 24,
            '.ms-Button--commandBar': {
                minWidth: 24
            }
        },
    })
}