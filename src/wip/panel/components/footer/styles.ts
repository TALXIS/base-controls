import { mergeStyleSets } from "@fluentui/react"

export const getFooterStyles = () => {
    return mergeStyleSets({
        footer: {
            display: 'flex',
            gap: 10
        }
    })
}