import { mergeStyleSets } from "@fluentui/react"
import { ITheme } from "@talxis/react-components";

export const getEditColumnsStyles = (theme: ITheme) => {
    return mergeStyleSets({
        sortableItemsWrapper: {
            display: 'flex',
            flexDirection: 'column',
            gap: 10
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