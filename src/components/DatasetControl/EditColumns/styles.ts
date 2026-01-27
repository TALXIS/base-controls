import { mergeStyleSets } from "@fluentui/react"
import { ITheme } from "@talxis/react-components";

export const getEditColumnsStyles = (theme: ITheme) => {
    return mergeStyleSets({
        panelFooter: {
            borderTop: `1px solid ${theme.semanticColors.bodyDivider}`
        },
        panelFooterButtons: {
            display: 'flex',
            gap: 10
        },
        sortableItemsWrapper: {
            display: 'flex',
            flexDirection: 'column',
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
            flex: 1
        },
        header: {
            borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`,
            paddingBottom: 15,
            paddingTop: 15
        },
        selectors: {
            display: 'flex',
            flexDirection: 'column',
            gap: 12
        },
        selector: {
            marginLeft: 15,
            marginRight: 15
        }
    });
}