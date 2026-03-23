import { mergeStyleSets } from "@fluentui/react"
import { ITheme } from "@talxis/react-components"

export const getViewSwitcherStyles = (theme: ITheme) => {
    return mergeStyleSets({
        commandBarButtonLabel: {
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: "1.3"
        },
        commandBarButtonRoot: {
            height: 32,
            maxWidth: '100%'
        },
        selectedViewItem: {
            backgroundColor: theme.semanticColors.buttonBackgroundPressed,
            '.ms-ContextualMenu-itemText': {
                fontWeight: 600
            }
        },
        menuIcon: {
            transition: 'transform 0.2s'
        },
        menuIconExpanded: {
            transform: 'rotate(180deg)'
        },
        viewItem: {
            '[class^="defaultViewLabel"]': {
                order: 2
            }
        },
        textContainer: {
            overflow: 'hidden',
        }
    })
}