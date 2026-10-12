import { mergeStyleSets } from "@fluentui/react"

export const getQuickFindStyles = () => {
    return mergeStyleSets({
        textFieldRoot: {
            marginLeft: 'auto'
        },
        fieldGroup: {
            width: 230,
        },
        calloutMain: {
            padding: 8
        },
        calloutBoldText: {
            fontWeight: 600
        },
        calloutColumnsWrapper: {
            display: 'flex',
            flexDirection: 'column',
            marginTop: 4
        },
        calloutWarningIcon: {
            position: 'relative',
            top: 1,
            marginRight: 4
        }
    })
}