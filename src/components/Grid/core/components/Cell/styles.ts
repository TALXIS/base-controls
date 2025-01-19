import { mergeStyleSets } from "@fluentui/react"
import { IColumn } from "@talxis/client-libraries"

export const getCellStyles = (columnAlignment: IColumn['alignment'], notificationsMinWidth: number, shouldNotificationsGrow: boolean, isEditing: boolean) => {
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
            //not when has notifications, but if we are rendering the overflow button
            flexGrow: shouldNotificationsGrow ? 1 : undefined,
            flexShrink: 1,
            flexBasis: 'auto',
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