import { mergeStyleSets } from "@fluentui/react"

export const getOverlayStyles = () => {
    return mergeStyleSets({
        overlay: {
            cursor: 'not-allowed',
            '&&': {
                backdropFilter: 'blur(0px)',
            }

        }
    })
}