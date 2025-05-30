import { mergeStyleSets } from "@fluentui/react"

export const getColorfulOptionsStyles = () => {
    return mergeStyleSets({
        root: {
            gap: '5px',
            display: 'flex',
            overflow: 'hidden',
            textAlign: 'center'
        },
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