import { mergeStyleSets } from "@fluentui/react"
import { IColumn } from "@talxis/client-libraries"
import { getJustifyContent } from "../../../grid/styles"

export const getNotificationStyles = (isActionColumn: boolean, columnAlignment: Required<IColumn['alignment']>) => {
    return mergeStyleSets({
        callout: {
            width: 320,
            padding: '20px 24px',
        },
        calloutContent: {
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            '.ms-CommandBar-primaryCommand': {
                gap: 10
            }
        },
        calloutTitle: {
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        calloutLink: {
            'i': {
                position: 'relative',
                top: 1,
                marginRight: 3
            }
        },
        calloutButtons: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8
        },
        notificationsRoot: {
            minWidth: isActionColumn ? 0 : undefined,
            flex: isActionColumn ? 1 : undefined,
        },
        notificationsPrimarySet: {
            order: 2,
            justifyContent: isActionColumn ? getJustifyContent(columnAlignment) : undefined
        }
    })
}