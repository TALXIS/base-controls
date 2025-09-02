import { mergeStyleSets } from "@fluentui/react"
import { IColumn } from "@talxis/client-libraries"

export const getCellContentStyles = (columnAlignment: IColumn['alignment']) => {
    return mergeStyleSets({
        controlRoot: {
            height: '100%',
            order: columnAlignment === 'right' ? 2 : undefined,
            minWidth: 0,
            overflow: 'hidden',
            flexGrow: 1,
            border: '2px solid transparent'
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
        },
        errorMessageRoot: {
            height: '100%'
        },
        errorMessageContent: {
            alignItems: 'center'
        }
    })
}