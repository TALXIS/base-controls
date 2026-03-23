import { ITheme, mergeStyleSets } from "@fluentui/react"

export const getMenuSectionStyles = (theme: ITheme) => {
    return mergeStyleSets({
        defaultViewLabel: {
            color: theme.semanticColors.disabledText
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