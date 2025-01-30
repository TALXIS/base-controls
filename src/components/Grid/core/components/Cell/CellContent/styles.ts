import { mergeStyleSets } from "@fluentui/react"
import { IColumn } from "@talxis/client-libraries"

export const getCellContentStyles = (columnAlignment: IColumn['alignment'], fillAllAvailableSpace: boolean) => {
    return mergeStyleSets({
        controlRoot: {
            height: '100%',
            order: columnAlignment === 'right' ? 2 : undefined,
            minWidth: 0,
            overflow: 'hidden',
            flexGrow: fillAllAvailableSpace ? 1 : undefined,
            border: '2px solid transparent',
        },
        controlContainer: {
            height: '100%'
        },
        loadingWrapper: {
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 10,
            paddingRight: 10
        },
        overridenControlContainer: {
            height: '100%'
        },
        shimmerWrapper: {
            height: 10
        }
    })
}