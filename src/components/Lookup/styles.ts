import { ITheme, mergeStyleSets } from "@fluentui/react"

export const getLookupStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            '[data-entity]': {
                '> span > div > span': {
                    color: theme.semanticColors.link,
                    cursor: 'pointer',
                    fontWeight: 600
                },
                ':hover': {
                    textDecoration: 'underline',
                    cursor: 'pointer !important'
                }
            }
        },
        selectedLookup: {
            color: 'red'
        },
        suggestions: {
            '.ms-Suggestions-title': {
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 15
            }
        },
        targetSelector: {
            display: 'flex',
            paddingLeft: 8,
            paddingRight: 8,
            paddingBottom: 8,
            gap: 8,
            '>span': {
                lineHeight: 15,
                minWidth: 'fit-content',
                color: theme.semanticColors.listText,
                fontWeight: 600
            }
        },
        targetSelectorLinks: {
            display: 'flex',
            gap: 5,
            flexWrap: 'wrap'
        },
        targetSelectorLink: {
            color: theme.palette.blackTranslucent40,
            '&[data-selected="true"]': {
                color: theme.semanticColors.link,
                fontWeight: 600
            }
        },
        createRecordBtn: {
            height: 38,
            width: '100%',
            '.ms-Button-menuIcon': {
                display: 'none'
            },
            '>.ms-Button-flexContainer.ms-Button-flexContainer': {
                justifyContent: 'flex-start'
            },
            '.ms-Button-textContainer': {
                flexGrow: 'initial',
                '>span': {
                    fontWeight: 600,
                }
            }
        }
    });
}