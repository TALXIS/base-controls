import { ITheme, mergeStyleSets } from "@fluentui/react"

export const getNotificationIconStyles = (theme: ITheme) => {
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
        link: {
            'i': {
                position: 'relative',
                top: 1,
                marginRight: 3
            }
        },
        buttons: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8
        },
        root: {
            '.ms-CommandBar-primaryCommand': {
                justifyContent: 'flex-end'
            }
        }
    })
}