import { ITheme, mergeStyles } from "@fluentui/react";

const ROOT_CLASSNAME = 'TALXIS__Multistage';
export const ACTIVE_INDICATOR_ANIMATION_LENGTH = 0.25;

export const getMultistageStyles = (numOfStages: number, theme: ITheme, bodyHeight?: string) => {
    return `${ROOT_CLASSNAME} ${mergeStyles({
        boxShadow: theme.semanticColors.cardShadow,
        borderRadius: 4,
        '.TALXIS__Multistage__header': {
            borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`
        },
        '.TALXIS__Multistage__header__error': {
            margin: 15,
            maxWidth: '100%'
        },
        '.TALXIS__Multistage__header__progress': {
            display: 'grid',
            position: 'relative',
            gap: 5,
            gridTemplateColumns: `repeat(${numOfStages}, minmax(0, 1fr))`,
            textAlign: 'center',
            //wrapper of every progress bar
            '> div': {
                paddingBottom: 10,
                ':hover': {
                    backgroundColor: theme.semanticColors.buttonBackgroundHovered,
                    cursor: 'pointer',
                },
                //progress bar
                '> div:first-child': {
                    height: 10,
                    backgroundColor: theme.semanticColors.buttonBackgroundPressed,
                },
                '.ms-TooltipHost': {
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    'span:first-child': {
                        display: 'block',
                        fontWeight: 600,
                        marginRight: 5,
                        marginLeft: 5,
                        marginTop: 10,
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis'
                    }
                },
                'i': {
                    position: 'relative',
                    top: -1
                },
                //first progress bar
                ':first-child > div:first-child': {
                    borderTopLeftRadius: 4,
                    '::after': {
                        content: "''",
                        borderTopLeftRadius: 'var(--active_indicator_border_left)',
                        borderTopRightRadius: 'var(--active_indicator_border_right)',
                        opacity: 'var(--active_indicator_opacity)',
                        transition: 'transform var(--active_indicator_animation_length) ease-out',
                        position: 'relative',
                        display: 'block',
                        width: '100%',
                        height: 10,
                        transform: 'translateX(var(--left))',
                        pointerEvents: 'none',
                        backgroundColor: theme.palette.themePrimary,
                    },
/*                     '& [data-current-step-valid="false"]>div:first-child>div:first-child::after': {
                        backgroundColor:  theme.semanticColors.errorIcon
                    } */
                },
                //last progress bar
                ':last-child > div:first-child': {
                    borderTopRightRadius: 4
                }
            },
            '> div[data-state="valid"]': {
                '> div:first-child': {
                    backgroundColor: theme.semanticColors.successBackground
                },
                '.TALXIS__Multistage__header__state-icon': {
                    color: theme.semanticColors.successIcon
                },
            },
            '> div[data-state="invalid"]': {
                '> div:first-child': {
                    backgroundColor: theme.semanticColors.errorBackground
                },
                '.TALXIS__Multistage__header__state-icon': {
                    color: theme.semanticColors.errorIcon
                }
            },
            '> div[data-state="warning"]': {
                '> div:first-child': {
                    backgroundColor: theme.semanticColors.warningBackground
                },
                '.TALXIS__Multistage__header__state-icon': {
                    color: theme.semanticColors.severeWarningIcon
                }
            },
            '> div[data-state="inactive"], > div:not([data-state])': {
                '.ms-TooltipHost span:first-child': {
                    color: theme.semanticColors.disabledText
                }
            },
            ' > div[data-state="in_progress"]': {
                '> div:first-child': {
                    backgroundColor: theme.palette.themeLight
                }
            },
            '.TALXIS__Multistage__header__progress__indicator--hidden': {
                opacity: 0
            }
        },
        '.TALXIS__Multistage__body': {
            height: bodyHeight,
            overflow: 'auto'
        },
        '.TALXIS__Multistage__body, .TALXIS__Multistage__footer': {
            padding: 15
        },
        '.TALXIS__Multistage__footer': {
            display: 'flex',
            '.ms-Button--icon': {
                height: 48,
                width: 48,
            },
            '[data-icon-next="true"] [data-icon-name="SkypeCircleArrow"]': {
                transform: 'rotate(180deg)'
            },
            justifyContent: 'center',
            'i': {
                fontSize: 32
            },
            ':has([data-button-submit])': {
                flexDirection: 'column',
                gap: 15,
                alignItems: 'center'
            }
        },
    })}`;
};