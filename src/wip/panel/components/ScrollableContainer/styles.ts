import { mergeStyleSets } from "@fluentui/react"

export const getScrollableContainerStyles = () => {
    return mergeStyleSets({
        scrollableContainer: {
            overflow: 'auto',
            paddingLeft: 15,
            paddingRight: 15,
            paddingTop: 12,
            paddingBottom: 12,
            flex: 1,
            scrollbarWidth: 'thin',
        }
    })
}