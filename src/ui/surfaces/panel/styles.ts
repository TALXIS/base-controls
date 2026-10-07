import { mergeStyleSets } from "@fluentui/react";
import { ITheme } from "@theme";

export const getPanelStyles = (theme: ITheme) => {
    return mergeStyleSets({
        footer: {
            borderTop: `1px solid ${theme.semanticColors.bodyDivider}`
        },
        footerInner: {
            padding: '12px 15px'
        },
        scrollableContent: {
            flexGrow: 1,
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            flex: 1
        },
        content: {
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            padding: 0
        },
        commands: {
            paddingTop: 16,
            paddingBottom: 16,
            borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`
        },
        header: {
            paddingLeft: 15,
            paddingRight: 15
        },
        closeButton: {
            //lines the glyph up with the body's 15px edge
            marginRight: 9
        },
        headerText: {
            whiteSpace: 'normal'
        },
        body: {
            flex: 1,
            overflow: 'auto',
            padding: 15,
            scrollbarWidth: 'thin'
        }
    });
}
