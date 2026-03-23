import { mergeStyleSets } from "@fluentui/react"

export const getScrollableContainerStyles = () => {
    return mergeStyleSets({
        scrollableContainer: {
            paddingLeft: 15,
            paddingRight: 15
        }
    })
}