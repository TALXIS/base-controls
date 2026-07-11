import { mergeStyleSets } from "@fluentui/react"

export const getColumnsStyles = (width: string, minWidth?: string) => {
    return mergeStyleSets({
        column: {
            backgroundColor: 'red',
            height: '100px',
            flexBasis: width,
            flexShrink: 1,
            minWidth: minWidth
        }
    })
}