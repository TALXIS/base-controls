import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getRecordGridStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            borderRadius: 5,
            padding: 8,
            paddingTop: 10,
            gap: 25,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: theme.semanticColors.bodyBackground,
            boxShadow: theme.semanticColors.cardShadow,
            '>span': {
                fontWeight: 600
            },
            '>i': {
                alignSelf: 'center',
                fontSize: 22,
            }

        },
        readOnlyGrid: {
            '.ag-theme-balham > div > .ms-MessageBar': {
                minHeight: 0,
                height: 0,
                '.ms-MessageBar-actionsSingleLine': {
                    position: 'relative',
                    top: -28
                }
            }
        },
        gridTitleWrapper: {
            borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`,
            paddingBottom: 10,
            '>span': {
                fontWeight: 600,
                fontSize: 15,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                display: 'block',
                maxWidth: 'calc(100% - 130px)'
            },
        },
        editableGrid: {
            position: 'relative',
            top: -5
        }
    })
}