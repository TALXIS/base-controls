import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getChangeGridStyles = (theme: ITheme, recordName: string) => {
    return mergeStyleSets({
        commandBar: {
            borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`
        },
        root: {
            '[col-id="valueDesc__virtual"]': {
                '.talxis-cell-text': {
                    fontWeight: 600
                },
                '[data-icon-name="Uneditable"]': {
                    display: 'none'
                }
            },
            '.talxis__grid-control__notification-bar': {
                '.ms-MessageBar-icon': {
                    display: 'none'
                },
                '[class^="notificationText"]': {
                    display: 'none'
                },
                '.ms-MessageBar-innerText': {
                    fontWeight: 600,
                    fontSize: 16,
                    '::after': {
                        content: `"${recordName}"`,
                        display: 'block'
                    }
                }
            }
        },
        recordName: {
            '.ms-Button-label': {
                fontSize: theme.fonts.mediumPlus.fontSize,
                fontWeight: 600,
                color: theme.semanticColors.bodyText
            }
        }
    })
}