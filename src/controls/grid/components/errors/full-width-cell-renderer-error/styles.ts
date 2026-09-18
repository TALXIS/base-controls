import { mergeStyleSets } from "@fluentui/react"

export const getFullWidthCellRendererErrorStyles = () => {
    return mergeStyleSets({
        errorMessageBarRoot: {
            height: '100%',
            justifyContent: 'center',
        }
    })
}