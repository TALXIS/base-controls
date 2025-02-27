import { mergeStyleSets } from "@fluentui/react"

export const getComboBoxStyles = (width?: number, height?: number) => {
    return mergeStyleSets({
        root: {
            height: height,
            width: width,
            display: 'flex',
            alignItems: 'center',
        },
        callout: {
            maxHeight: '300px !important',
        },
    })
}