import { mergeStyleSets } from "@fluentui/react"

export const getFullRowLoadingStyles = () => {
    return mergeStyleSets({
        fullRowLoadingRoot: {
            width: '100%',
            height: '100%'
        },
        shimmerWrapper: {
            height: '100%'
        }
    });
}