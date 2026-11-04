import { mergeStyleSets } from "@fluentui/react"

export const getColorfulOptionsStyles = () => {
    return mergeStyleSets({
        root: {
            gap: '5px',
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            overflow: 'hidden',
            textAlign: 'center'
        }
    })
}
