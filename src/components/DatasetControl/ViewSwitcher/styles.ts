import { mergeStyleSets } from "@fluentui/react"
import { ITheme } from "@talxis/react-components"

export const getViewSwitcherStyles = (theme: ITheme) => {
    return mergeStyleSets({
        commandBarButtonLabel: {
            fontWeight: 600
        },
        commandBarButtonRoot: {
            height: 32
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
        }
    })
}