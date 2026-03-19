import { mergeStyleSets } from "@fluentui/react"

export const getOverlayStyles = () => {
    return mergeStyleSets({
        overlay: {
            backdropFilter: 'blur(2px)',
            cursor: 'wait',
        }
    })
}