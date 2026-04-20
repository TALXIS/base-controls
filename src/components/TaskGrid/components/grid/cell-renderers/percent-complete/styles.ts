import { mergeStyleSets } from "@fluentui/react"

export const getPercentCompleteStyles = () => {
    return mergeStyleSets({
        root: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            justifyContent: 'center',
            paddingRight: 8,
            paddingLeft: 8,
        },
        progressIndicatorRoot: {
            display: 'flex',
            gap: 5
        },
        itemProgress: {
            flexGrow: 1
        },
        itemDescription: {
            '::after': {
                content: '"%"',
                display: 'inline'
            }
        }
    })
}