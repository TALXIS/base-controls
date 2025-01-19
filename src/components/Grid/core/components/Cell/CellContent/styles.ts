import { mergeStyleSets } from "@fluentui/react"
import { IColumn } from "@talxis/client-libraries"

export const getCellContentStyles = (columnAlignment: IColumn['alignment'], fillAllAvailableSpace: boolean) => {
    return mergeStyleSets({
        cellContent: {
            height: '100%',
            order: columnAlignment === 'right' ? 2 : undefined,
            minWidth: 0,
            overflow: 'hidden',
            flexGrow: fillAllAvailableSpace ? 1 : undefined
        }
    })
}