import { mergeStyleSets } from "@fluentui/react"

export const getEditColumnsStyles = () => {
    return mergeStyleSets({
        sortableItemsWrapper: {
            display: 'flex',
            flexDirection: 'column',
            gap: 10
        },
    });
}