import { ITheme, mergeStyleSets } from "@fluentui/react"

export const getHeaderStyles = (theme: ITheme) => {
    return mergeStyleSets({
        selectors: {
            display: 'flex',
            flexDirection: 'column',
            gap: 12
        },
        header: {
            borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`,
            padding: 15,
            display: 'flex',
            flexDirection: 'column',
            gap: 12
        },
    })
}