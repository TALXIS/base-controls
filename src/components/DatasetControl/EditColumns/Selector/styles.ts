import { mergeStyleSets } from "@fluentui/react"

export const getSelectorStyles = () => {
    return mergeStyleSets({
        optionContainer: {
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px'
        },
        optionText: {
            flexGrow: 1,
            gap: 10
        }
    })
}