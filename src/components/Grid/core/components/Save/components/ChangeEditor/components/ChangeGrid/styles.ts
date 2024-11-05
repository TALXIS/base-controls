import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getChangeGridStyles = (theme: ITheme) => {
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