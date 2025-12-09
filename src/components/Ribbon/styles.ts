import { mergeStyleSets } from "@fluentui/react"

export const getRibbonStyles = () => {
    return mergeStyleSets({
        container: {
            flex: 1,
        },
        shimmerRoot: {
            width: '100%',
        },
        shimmerWrapper: {
            height: 44
        },
        commandBtnRoot: {
            'img': {
                width: 18
            }
        }
    })
}