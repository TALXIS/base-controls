import { mergeStyleSets } from "@fluentui/react"
import { IColumn } from "@talxis/client-libraries"
import { getJustifyContent } from "../GridCellRenderer/styles"

export const getGridInlineRibbonStyles = (columnAlignment: Required<IColumn['alignment']>, height: number) => {
    return mergeStyleSets({
        gridInlineRibbonRoot: {
            display: 'flex',
            alignItems: 'center',
            height: height
        },
        primarySet: {
            justifyContent: getJustifyContent(columnAlignment)
        },
        ribbonContainer: {
            minWidth: 0
        },
        shimmerWrapper: {
            height: 10
        },
        shimmerRoot: {
            width: 'initial',
            paddingLeft: 10,
            paddingRight: 10
        },
    })
}