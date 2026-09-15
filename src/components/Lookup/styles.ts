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

/** The height as something to do arithmetic with, which is nothing when the control fills its container. */
const getHeight = (height?: number | string) => {
    if(typeof height !== 'number' || height === -1 || height === 0) {
        return undefined;
    }
    return height;
}

export const getLookupStyles = (theme: ITheme, isSingleSelect: boolean, height?: number | string) => {
    const _height = getHeight(height);
    const fillsAvailableSpace = height === '100%';
    return mergeStyleSets({
        displayName: 'talxis__lookupControl',
        root: {
            '[data-navigation-enabled="true"]': {
                '.ms-Button-label': {
                    color: `${theme.semanticColors.link} !important`,
                    fontWeight: 600,
                    marginLeft: 2
                },
                ':hover': {
                    textDecoration: 'underline',
                    cursor: 'pointer !important'
                }
            },
            '.ms-BasePicker-itemsWrapper .ms-CommandBar.ms-CommandBar': {
                height: _height && isSingleSelect ? _height - 6 : undefined
            },
            '.ms-BasePicker-text': {
                //filling is the container's answer, so there is no floor to keep it off: the picker is as
                //tall as what it is drawn in, and as short
                minHeight: fillsAvailableSpace ? undefined : _height ?? 32,
                height: fillsAvailableSpace ? '100%' : 'min-content',
                paddingRight: !isSingleSelect ? 36 : undefined,
                alignItems: 'baseline',

                'input': {
                    alignSelf: 'center'
                },
            },
            '.TALXIS__input-buttons__root': {
                height: _height && `${_height - 3}px !important`
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

export const getSuggestionsCalloutStyles = (theme: ITheme) => {
    return mergeStyleSets({
        suggestionsCallout: {
            '.ms-Suggestions-title': {
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
            }
        },
        suggestionsContainer: {
            '.ms-Suggestions-item': {
                ':hover': {
                    backgroundColor: theme.semanticColors.buttonBackgroundHovered
                },
                '>.ms-Button--command[aria-selected="true"]': {
                    backgroundColor: theme.semanticColors.buttonBackgroundPressed
                }
            }
        },
    })
}   