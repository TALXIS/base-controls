import { mergeStyleSets } from "@fluentui/react"

export const getColorfulOptionStyles = () => {
    return mergeStyleSets({
        cicrleIconStyle: {
            marginRight: '8px',
            fontSize: '12px'
        },
        colorfulOptionWrapper: {
            display: 'flex',
            overflow: 'hidden'
        },
        optionText: {
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            minWidth: '0px',
            maxWidth: '100%',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            display: 'inline-block',
        },
    })
}