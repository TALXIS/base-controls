import { ITheme, mergeStyles, mergeStyleSets } from "@fluentui/style-utilities";
import { borderAnim } from "@legacy/utilities/styles";


export const getTagPickerStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            '&:not([class*="--underlined"]) .ms-BasePicker-text::after': {
                inset: '-1px 0px'
            },
            '.ms-BasePicker-text': {
                backgroundColor: theme.semanticColors.inputBackground,
                borderColor: theme.semanticColors.inputBorder,
                minWidth: 'inherit',
                '::after': {
                    zIndex: 1
                },
                '.ms-BasePicker-itemsWrapper': {
                    overflow: 'hidden'
                },
                '.ms-BasePicker-input': {
                    height: 31,
                    paddingLeft: 8,
                    fontFamily: `${theme.fonts.small.fontFamily} !important`
                }
            },
            '&[class*="--stack"]': {
                '.ms-BasePicker-itemsWrapper': {
                    width: '100%',
                    '>div': {
                        width: '100%'
                    },
                    '.ms-CommandBar-secondaryCommand': {
                        width: '100%',
                        '.ms-OverflowSet-item:first-child': {
                            flexGrow: 1
                        }
                    }
                }
            },
            '.ms-BasePicker-itemsWrapper': {
                display: 'flex',
                padding: 2.5,
                gap: 2.5,
                '.TALXIS__input-buttons__root, .ms-CommandBar-secondaryCommand': {
                    maxWidth: '100%',
                },
                '.ms-CommandBar': {
                    height: 26,
                    '.ms-Button-label': {
                        lineHeight: "1.3"
                    },
                    '.ms-OverflowSet-item:first-child': {
                        minWidth: 0,
                        flexShrink: 1,
                        '.ms-Button--commandBar': {
                            cursor: 'text',
                            userSelect: 'text',
                            backgroundColor: 'transparent'
                        },
                        '.ms-Button-textContainer': {
                            overflow: 'hidden'
                        },
                        '.ms-Button-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }
                    }
                }
            },
            '&[class*="--read-only"]:has(.ms-BasePicker-itemsWrapper) input': {
                display: 'none'
            },
            '>div': {
                display: 'flex',
                '.ms-BasePicker': {
                    flexGrow: 1,
                    overflow: 'hidden'
                },
                '>.TALXIS__input-buttons__root': {
                    alignSelf: 'end',
                    width: 0,
                    position: 'relative',
                    right: 41,
                    bottom: 1,
                    height: 'calc(var(--input-height, 30px) - 1px)'
                }
            },
            '&:not(:focus-within) .ms-BasePicker-text::after': {
                display: 'none'
            },
            '&[class*="--underlined"] .ms-BasePicker-text::after, &[class*="--underlined"] .ms-BasePicker-text': {
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
            },
            '&[class*="--underlined"] .ms-BasePicker-text': {
                borderBottomLeftRadius: 0
            },
            '&[class*="--underlined"]:hover .ms-BasePicker-text': {
                borderBottomColor: theme.semanticColors.inputBorderHovered
            },
            '&[class*="--underlined"]:focus-within .ms-BasePicker-text': {
                borderBottomColor: 'transparent'
            },
            '&[class*="--underlined"]:not([class*="--has-error"]) .ms-BasePicker-text::after': {
                animation: `${borderAnim} 0.2s forwards`,
                inset: '-0px 0px',
                borderBottom: `2px solid ${theme.semanticColors.inputFocusBorderAlt}`,
                borderRadius: '0px',
                pointerEvents: 'none',
                position: 'absolute',
            },
            '&[class*="--read-only"]:not([class*="--has-error"]) .ms-BasePicker-text::after': {
                borderColor: theme.semanticColors.disabledBorder
            },
            '&[class*="--underlined"][class*="--has-error"] .ms-BasePicker-text': {
                borderRadius: 0
            },
            '&[class*="--has-error"] .ms-BasePicker-text': {
                borderColor: theme.semanticColors.errorText,
                '::after': {
                    borderColor: theme.semanticColors.errorText
                }
            }
        },
        wrapper: {
            ':has(>[class*="TALXIS__input-buttons__root"]) .ms-BasePicker-input': {
                paddingRight: 45
            }
        }
    });
}
export const getSuggestionsStyles = () => {
    return mergeStyles({
        '.ms-OverflowSet-item:first-child .ms-TooltipHost': {
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
        },
        ".ms-OverflowSet-item:first-child .ms-TooltipHost  > span": {
            overflow: "hidden",
            textOverflow: "ellipsis"
        },
        ".ms-OverflowSet-item:first-child": {
            flexGrow: 1,
            flexShrink: 1,
            minWidth: "0",
        },
        ".ms-OverflowSet-item:first-child i": {
            marginRight: "14px",
            width: "23px"
        },
        ".ms-Suggestions-item::after": {
            border: "none"
        },
        ".ms-CommandBar": {
            height: "40px"
        },
        ".ms-CommandBar-secondaryCommand": {
            maxWidth: "100%",
            justifyContent: "space-between",
            width: "100%"
        },
        ".TALXIS__command-bar": {
            maxWidth: "100%",
            width: "100%"
        },
        ".ms-Suggestions-itemButton.is-suggested:hover": {
            background: "none"
        },
        ".ms-Button-flexContainer": {
            justifyContent: "space-between"
        },
        ".ms-CommandBar, .ms-Button--commandBar": {
            backgroundColor: "inherit"
        },
        ".ms-Button--action": {
            paddingLeft: "5px"
        },
        ".ms-OverflowSet-item:first-child .ms-Button--commandBar img": {
            marginRight: "10px"
        },
        ".TALXIS__tag-picker__suggestion__btn--hidden": {
            display: "none"
        },
        ".TALXIS__tag-picker__suggestions__wrapper": {
            display: "flex",
            flexDirection: "column",
            textAlign: "left",
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            '>span': {
                textOverflow: 'ellipsis',
                overflow: 'hidden'
            }
        },
    });
};


