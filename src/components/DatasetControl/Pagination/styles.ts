import { ITheme, mergeStyleSets } from "@fluentui/react"

export const getPaginationStyles = (theme: ITheme) => {
    return mergeStyleSets({
        paginationRoot: {
            display: 'flex'
        },
        commandBarRoot: {
            flexGrow: 1
        },
        currentPageBtn: {
            '.ms-Button-label': {
                color: theme.semanticColors.bodyText
            }
        },
        pageSizeSwitcherRoot: {
            height: 44
        }
    })
}