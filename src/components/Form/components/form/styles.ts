import { mergeStyleSets } from "@fluentui/react"

export const getFormStyles = () => {
    return mergeStyleSets({
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: 12
        }
    })
}