import { mergeStyleSets } from "@fluentui/react"

export const getLoadingOverlayStyles = () => {
    return mergeStyleSets({
        loadingOverlay: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            backdropFilter: 'blur(2px)',
            cursor: 'wait',
        },
        loadingOverlayContainer: {
            position: 'relative'
        }
    })
}