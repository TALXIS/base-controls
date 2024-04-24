import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getTargetSelectorStyles = (theme: ITheme) => {
    return mergeStyleSets({
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
    })
}

export const getLookupStyles = (theme: ITheme, height: number) => {
    return mergeStyleSets({
        root: {
            '[class*="TALXIS__tag-picker__search-btn"][class*="TALXIS__tag-picker__search-btn"]': {
                top: 0,
                bottom: 0,
                margin: `auto 0`
            },
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
            },
            '.ms-BasePicker-text': {
                height: height ?? undefined,
                alignItems: 'baseline',
                'input': {
                    height: '100%'
                }
            }
        },
        suggestions: {
            '.ms-Suggestions-title': {
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 15
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