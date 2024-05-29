import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getChangeEditorStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            '.ag-row': {
                borderBottom: 'none'
            },
            '.ms-Dialog-title': {
                borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`
            },
            '.ms-Dialog-content': {
                backgroundColor: 'var(--talxis-main-bodyBackgroundMain, #faf9f8)'
            }
        },
        recordGrids: {
            marginTop: 15,
            display: 'flex',
            flexDirection: 'column',
            gap: 15,
        },
        saveBtn: {
            '.ms-Button-flexContainer': {
                gap: 5,
                '>span': {
                    order: 2
                },
                '>div': {
                    order: 1
                }
            }
        }
    })
}