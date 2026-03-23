import { mergeStyleSets } from "@fluentui/react"

export const getLoadingOverlayContainerStyles = () => {
    return mergeStyleSets({
        loadingOverlayContainer: {
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            position: 'initial',
            minHeight: 0
        }
    })
}