import { mergeStyleSets } from "@fluentui/react"

export const getLoadingOverlayStyles = () => {
    return mergeStyleSets({
        overlayContainer: {
            position: 'relative'
        },
        overlay: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1
        }
    })
}