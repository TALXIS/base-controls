import { mergeStyleSets } from "@fluentui/react"

export const getCellContentStyles = (isRightAlignedColumn: boolean) => {
    return mergeStyleSets({
        cellContent: {
            flex: 1,
            height: '100%',
            textAlign: isRightAlignedColumn ? 'right' : 'left',
            order: isRightAlignedColumn ? 2 : undefined,
            minWidth: 0,
            overflow: 'hidden'
        }
    })
}