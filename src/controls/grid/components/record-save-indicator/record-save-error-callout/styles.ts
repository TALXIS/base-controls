import { mergeStyleSets } from "@fluentui/react"
import { ITheme } from "@theme"

/** How far the list of fields grows before it scrolls, since a record can refuse every field it has. */
const MAX_LIST_HEIGHT = 220;

export const getRecordSaveErrorCalloutStyles = (theme: ITheme) => {
    return mergeStyleSets({
        errorCallout: {
            boxSizing: 'border-box',
            width: 340,
            maxWidth: '90vw',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
        },
        icon: {
            fontSize: 16,
            color: theme.semanticColors.errorText,
        },
        title: {
            fontWeight: 600,
        },
        fields: {
            display: 'flex',
            flexDirection: 'column',
            maxHeight: MAX_LIST_HEIGHT,
            overflowY: 'auto',
        },
        field: {
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            paddingTop: 8,
            paddingBottom: 8,
            //a rule between fields, so a record refusing several of them reads as a list
            ':not(:first-child)': {
                borderTop: `1px solid ${theme.semanticColors.bodyDivider}`,
            },
            ':first-child': {
                paddingTop: 0,
            },
            ':last-child': {
                paddingBottom: 0,
            },
        },
        fieldName: {
            fontWeight: 600,
        },
        message: {
            color: theme.semanticColors.bodyText,
        },
        footer: {
            display: 'flex',
            justifyContent: 'flex-end',
        },
    })
}
