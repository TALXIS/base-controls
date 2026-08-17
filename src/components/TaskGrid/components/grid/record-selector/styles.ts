import { ITheme, mergeStyleSets } from "@fluentui/react"

export const getRecordSelectorStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            height: 285,
            width: 300,
            '[class^="paginationRoot"]': {
                '.ms-Button, .ms-CommandBar': {
                    height: 36
                }
            }
        },
        headerContainer: {
            padding: 8,
            marginBottom: 0,
            '.ms-TextField, .ms-TextField-fieldGroup': {
                width: '100%'
            }
        },
        quickFindContainer: {
            width: '100%'
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
        },
        controlContainer: {
            flex: 1,
            borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`,
            overflow: 'auto'
        }
    })
}