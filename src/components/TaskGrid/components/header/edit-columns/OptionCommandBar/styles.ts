import { mergeStyleSets } from "@fluentui/react"

export const getCustomColumnSuffixStyles = () => {
    return mergeStyleSets({
        commandBar: {
            height: 24,
            backgroundColor: 'transparent'
        },
        button: {
            backgroundColor: 'transparent',
            width: 32,
            minWidth: 32,
        }
    })
}