import { mergeStyleSets } from "@fluentui/react"

export const getCellStyles = (isRightAlignedColumn: boolean, notificationsMinWidth: number) => {
    return mergeStyleSets({
        cellWrapper: {
            flex: 1,
            display: 'flex',
            overflow: 'hidden',
            alignItems: 'center',
            height: '100%',
        },
        shimmerWrapper: {
            height: 10
        },
        notificationWrapper: {
            display: 'flex',
            flexGrow: 1,
            flexShrink: 0,
            flexBasis: 0,
            minWidth: notificationsMinWidth,
            alignItems: 'center',
            overflow: 'hidden',
            order: isRightAlignedColumn ? 1 : undefined,
            justifyContent: isRightAlignedColumn ? 'flex-start' : 'flex-end',
            '.ms-CommandBar .ms-CommandBar-primaryCommand': {
                justifyContent: isRightAlignedColumn ? 'flex-start' : undefined
            }
        },
        notifications: {
            minWidth: 0,
            flex: 1,
            order: isRightAlignedColumn ? 2 : undefined
        }
    })
}