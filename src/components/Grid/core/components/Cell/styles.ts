import { mergeStyleSets } from "@fluentui/react"

export const getCellStyles = () => {
    return mergeStyleSets({
        cellWrapper: {
            flex: 1,
            display: 'flex',
            overflow: 'hidden',
            alignItems: 'center',
            height: '100%',
        },
        shimmerWrapper: {
            height: 10
        },
        notifications: {

        },
        cellContent: {
            flex: 1,
            textAlign: 'initial'
        }
    })
}