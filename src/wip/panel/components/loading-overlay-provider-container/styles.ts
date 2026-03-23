import { mergeStyleSets } from "@fluentui/react"

export const getLoadingOverlayProviderContainerStyles = () => {
    return mergeStyleSets({
        container: {
            position: 'unset',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0
        }
    })
}