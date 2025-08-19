import { mergeStyleSets } from "@fluentui/react"

export const getFileRendererStyles = () => {
    return mergeStyleSets({
        fileRendererRoot: {
            display: 'flex',
            gap: 5,
            alignItems: 'center'
        },
        link: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        thumbnail: {
            width: 32
        },
        spinner: {
            width: 18,
            height: 18
        }
    })
}