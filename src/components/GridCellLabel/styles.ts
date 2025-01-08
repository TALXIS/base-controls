import { mergeStyleSets } from "@fluentui/react"

export const getGridCellLabelStyles = () => {
    return mergeStyleSets({
        root: {
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            paddingLeft: 10,
            paddingRight: 10
        },
        content: {
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        }
    })
}