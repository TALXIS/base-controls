import { mergeStyleSets } from "@fluentui/react"

export const getColorfulOptionStyles = () => {
    return mergeStyleSets({
        option: {
            borderRadius: 5,
            padding: 2,
            paddingLeft: 4,
            paddingRight: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flexGrow: 1,
        }
    })
}

export const getOptionSetStyles = () => {
    return mergeStyleSets({
        root: {
            gap: 5,
            display: 'flex',
            overflow: 'hidden',
            flexGrow: 1,
            textAlign: 'center'
        }
    })
}