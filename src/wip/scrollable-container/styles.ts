import { mergeStyleSets } from "@fluentui/react"

export const getScrollableContainerStyles = () => {
    return mergeStyleSets({
        scrollableContainer: {
            overflow: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            scrollbarWidth: 'thin',
        }
    });
};