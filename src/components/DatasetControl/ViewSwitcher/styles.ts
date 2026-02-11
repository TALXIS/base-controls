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
        },
        menuCallout: {
            width: 250,
        },
        menuSectionContent: {
            maxHeight: 200,
            overflow: 'auto',
            scrollbarWidth: 'thin'
        },
        menuSectionHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            width: '100%',
            borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`,
            color: theme.semanticColors.menuHeader,
        },
        menuSectionHeaderPadding: {
            padding: 8
        },
        menuSectionHeaderLabel: {
            color: theme.semanticColors.menuHeader,
            fontWeight: 600,
        }
    })
}