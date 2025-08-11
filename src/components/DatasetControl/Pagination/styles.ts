import { mergeStyleSets } from "@fluentui/react"

export const getPaginationStyles = () => {
    return mergeStyleSets({
        paginationRoot: {
            display: 'flex'
        },
        commandBarRoot: {
            flexGrow: 1
        }
    })
}