import { mergeStyleSets } from "@fluentui/react"

export const getQuickFindStyles = () => {
    return mergeStyleSets({
        calloutMain: {
            padding: 8
        },
        calloutBoldText: {
            fontWeight: 600
        },
        quickFindContainer: {
            
        },
        calloutColumnsWrapper: {
            display: 'flex',
            flexDirection: 'column',
            marginTop: 4,
            overflow: 'auto',
            scrollbarWidth: 'thin',
            maxHeight: 200
        },
        calloutWarningIcon: {
            position: 'relative',
            top: 1,
            marginRight: 4
        },
        calloutColumnName: {
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flexShrink: 0
        }
    })
}