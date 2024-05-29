import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getTargetSelectorStyles = (theme: ITheme) => {
    return mergeStyleSets({
        targetSelector: {
            display: 'flex',
            paddingLeft: 8,
            paddingRight: 8,
            paddingBottom: 8,
            gap: 8,
            paddingTop: 8,
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

const getHeight = (height: number) => {
    if(height === -1 || height === 0) {
        return undefined;
    }
    return height;
}

export const getLookupStyles = (theme: ITheme, height: number, isSingleSelect: boolean) => {
    const _height = getHeight(height);
    return mergeStyleSets({
        root: {
            '[class*="TALXIS__tag-picker__search-btn"][class*="TALXIS__tag-picker__search-btn"]': {
                top: 0,
                bottom: 0,
                margin: `auto 0`,
                right: 5
            },

            '[data-navigation-enabled="true"]': {
                '> span > div > span': {
                    color: theme.semanticColors.link,
                    cursor: 'pointer',
                },
                ':hover': {
                    textDecoration: 'underline',
                    cursor: 'pointer !important'
                }
            },
            '.ms-BasePicker-itemsWrapper .ms-CommandBar': {
                height: _height && isSingleSelect ? _height - 6 : undefined
            },
            '.ms-BasePicker-text': {
                minHeight: _height ?? 36,
                height: 'min-content',
                paddingRight: !isSingleSelect ? 36 : undefined,
                alignItems: 'baseline',

                'input': {
                    alignSelf: 'center'
                },
                '.hover-only': {
                    animationName: 'none'
                },
                '::after': {
                    inset: '0px !important'
                }
            }
        },
        suggestions: {
            '.ms-Suggestions-title': {
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
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