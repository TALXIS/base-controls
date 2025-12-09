import { mergeStyleSets } from "@fluentui/react"

export const getRecordSaveErrorCalloutStyles = () => {
    return mergeStyleSets({
        errorCallout: {
            width: 320,
            maxWidth: '90%',
            padding: '20px 24px',
        },
        errorCalloutDismissLink: {
            marginTop: 20,
            display: 'block'
        },
        errorCalloutTitle: {
            marginBottom: 12
        },
        errorCalloutContent: {
            marginTop: 8
        },
    })
}