import { mergeStyleSets } from "@fluentui/react"

export const getOptionStyles = () => {
    return mergeStyleSets({
        optionContainer: {
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px'
        }
    })
}