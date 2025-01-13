import { mergeStyleSets } from "@fluentui/react"

export const getCellStyles = (columnAlignment: 'left' | 'center' | 'right', notificationsMinWidth: number, hasNotifications: boolean, isEditing: boolean) => {
    return mergeStyleSets({
        cellWrapper: {
            flex: 1,
            display: 'flex',
            overflow: 'hidden',
            alignItems: 'center',
            height: '100%',
            marginLeft: isEditing ? - 1 : undefined,
            marginRight: isEditing ? - 1 : undefined
        },
        shimmerWrapper: {
            height: 10
        },
        notificationWrapper: {
            display: 'flex',
            flexGrow: hasNotifications ? 1 : undefined,
            flexShrink: 0,
            flexBasis: 0,
            minWidth: notificationsMinWidth,
            alignItems: 'center',
            overflow: 'hidden',
            order: columnAlignment === 'right' ? 1 : undefined,
            justifyContent: columnAlignment === 'right' ? 'flex-start' : 'flex-end',
            '.ms-CommandBar .ms-CommandBar-primaryCommand': {
                justifyContent: columnAlignment === 'right' ? 'flex-start' : undefined
            }
        },
        notifications: {
            minWidth: 0,
            flex: 1,
            order: columnAlignment === 'right'? 2 : undefined
        }
    })
}