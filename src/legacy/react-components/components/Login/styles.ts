import { getTheme, mergeStyles } from "@fluentui/react";

const ROOT_CLASSNAME = 'TALXIS__Login';
const CALLOUT__CLASSNAME = 'TALXIS__Login--callout';
export const getLoginCalloutStyles = (propClassName?: string) => {
    const theme = getTheme();
    let className = CALLOUT__CLASSNAME;
    if (propClassName) {
        className = `${className} ${propClassName}`
    }
    return `${className} ${mergeStyles({
        '.ms-Callout-main': {
            '>div:first-child': {
                display: 'flex',
                '.ms-Button--commandBar': {
                    height: 44
                },
                '>span': {
                    flexGrow: 1,
                    textAlign: 'left',
                    lineHeight: 44,
                    paddingLeft: 10
                }
            },
            '> .TALXIS__Login--callout__footer': {
                borderTop: `1px solid ${theme.semanticColors.bodyDivider}`,
                '> .ms-Button--commandBar': {
                    width: '100%',
                    backgroundColor: 'rgba(0,0,0,.04)',
                    ':hover': {
                        backgroundColor: theme.semanticColors.menuItemBackgroundHovered
                    },
                    ':active': {
                        backgroundColor: theme.semanticColors.menuItemBackgroundPressed
                    },
                    '> .ms-Button-flexContainer': {
                        justifyContent: 'flex-start'
                    },
                    '.ms-Persona': {
                        '.ms-Persona-details': {
                            '>div': {
                                display: 'block'
                            }
                        },
                        '.ms-Persona-primaryText': {
                            fontSize: 12
                        }
                    }
                },
            },
            '.ms-Persona': {
                height: 'auto',
                padding: 15,
                rowGap: 5,
                '.ms-Persona-details': {
                    rowGap: 3
                },
                '.ms-Persona-primaryText': {
                    fontSize: 18,
                    fontWeight: 700
                },
                '.ms-Persona-secondaryText': {
                    color: theme.palette.black,
                    fontSize: 13
                },
                '.ms-Persona-tertiaryText': {
                    display: 'flex',
                    flexDirection: 'column',
                    rowGap: 5,
                    'a': {
                        textDecoration: 'underline'
                    }
                }
            }
        }
    })}`;
};

export const getLoginStyles = (propClassName?: string) => {
    let className = ROOT_CLASSNAME;
    if (propClassName) {
        className = `${className} ${propClassName}`
    }
    return `${className} ${mergeStyles({
        padding: 5,
        '> span .ms-Persona:has(.ms-Persona-primaryText:empty):has(.ms-Persona-secondaryText:empty):has(.ms-Persona-tertiaryText:empty):has(.ms-Persona-optionalText:empty)': {
            display: 'block'
        }
    })}`;
};