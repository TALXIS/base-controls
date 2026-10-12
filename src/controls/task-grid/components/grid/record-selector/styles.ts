import { ITheme, mergeStyleSets } from "@fluentui/react"

export const getRecordSelectorStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            width: 300,
        },
        header: {
            padding: 8,
        },
        body: {
            borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`,
            overflow: 'auto'
        },
        recordList: {
            display: 'flex',
            flexDirection: 'column',
        },
        recordsNotFoundContainer: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8
        },
        recordsNotFoundIcon: {
            fontSize: 38
        },
        recordButton: {
            width: '100%',
            height: 36,
            justifyContent: 'flex-start',
            textAlign: 'left'
        },
        loadingContainer: {
            display: 'flex',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center'
        }
    })
}
