import { mergeStyleSets } from "@fluentui/react"

export const getCellContentStyles = (columnAlignment: 'left' | 'center' | 'right', hasNotifications: boolean) => {
    return mergeStyleSets({
        cellContent: {
            height: '100%',
            order: columnAlignment === 'right' ? 2 : undefined,
            minWidth: 0,
            overflow: 'hidden',
            flexGrow: !hasNotifications ? 1 : undefined
        }
    })
}