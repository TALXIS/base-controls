import { mergeStyleSets } from "@fluentui/react"

export const getMenuListStyles = () => {
    return mergeStyleSets({
        menuCallout: {
            width: 250,
        },
    })
}