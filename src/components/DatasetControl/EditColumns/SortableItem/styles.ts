import { ITheme, mergeStyleSets } from "@fluentui/react"

export const getSortableItemStyles = (theme: ITheme) => {
    return mergeStyleSets({
        sortableItem: {
            display: 'flex',
            padding: 5,
            paddingLeft: 10,
            height: 26,
            cursor: 'grab',
            alignItems: 'center',
            gap: 5,
            borderRadius: 5,
            backgroundColor: theme.semanticColors.buttonBackgroundPressed,
            '&:active': {
                cursor: 'grabbing'
            },
            '& > span': {
                flexGrow: 1,
                fontWeight: 600,
                overflow: 'hidden',
                minWidth: 0,
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
            },
        },
    })
}