import { mergeStyleSets } from "@fluentui/react"

export const getLoadingOverlayStyles = () => {
    return mergeStyleSets({
        root: {
            display: 'flex',
            flexDirection: 'column',
            gap: 10
        },
        message: {
            fontWeight: 600
        }
    })
}