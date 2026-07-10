import { mergeStyleSets } from "@fluentui/react"

export const getRowStyles = (height?: string, columns?: number) => {
    return mergeStyleSets({
        row: {
            display: 'grid',
            gridTemplateColumns: columns ? `repeat(${columns}, 1fr)` : '1fr',
        }
    })
}