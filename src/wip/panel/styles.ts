import { ITheme, mergeStyleSets } from "@fluentui/react"

export const getPanelStyles = (theme: ITheme) => {
    return mergeStyleSets({
        panelFooter: {
            borderTop: `1px solid ${theme.semanticColors.bodyDivider}`
        },
        panelFooterButtons: {
            display: 'flex',
            gap: 10
        },
        panelCommands: {
        },
        panelScrollableContent: {
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
        },
        panelContent: {
             display: 'flex',
             flexDirection: 'column',
             minHeight: 0,
             padding: 0
        },
        scrollableContainer: {
            overflow: 'auto',
            paddingLeft: 15,
            paddingRight: 15,
            paddingTop: 12,
            paddingBottom: 12,
            flex: 1,
            scrollbarWidth: 'thin',
        },
        header: {
            borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`,
            paddingBottom: 15,
            paddingTop: 15
        },
    })
}