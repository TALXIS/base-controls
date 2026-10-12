import { mergeStyleSets } from "@fluentui/react"

export const getColumnSelectorStyles = () => {
    return mergeStyleSets({
        root: {
            '>div>div>div': {
                gridTemplateColumns: 'min-content'
            }
        }
    })
}