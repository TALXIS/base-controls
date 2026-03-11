import { mergeStyleSets } from "@fluentui/react"

export const getOptionTextStyles = () => {
    return mergeStyleSets({
        optionText: {
            flexGrow: 1,
            gap: 10,
            backgroundColor: 'transparent !important'
        }
    })
}