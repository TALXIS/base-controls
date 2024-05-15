import { mergeStyleSets } from "@fluentui/react"

export const getSaveStyles = () => {
    return mergeStyleSets({
        root: {
            '&[data-dirty="false"]': {
                '.ms-MessageBar': {
                    backgroundColor: 'transparent',
                    '.ms-MessageBar-icon': {
                        display: 'none'
                    }
                }
            },
            '.ms-MessageBar-icon': {
                alignItems: 'center'
            },
            '.ms-MessageBar-actionsSingleLine': {
                marginRight: 0
            },
            '.ms-MessageBar-innerText': {
                textAlign: 'left'
            },
            '&[data-dirty="true"]': {
                cursor: 'pointer'
            }
        },
        notificationText: {
            whiteSpace: 'normal',
        },
        actions: {
            height: '100%',
            '.ms-Button': {
                height: '100%',
                backgroundColor: 'transparent',
                ':last-child': {
                    marginLeft: 0
                }
            }
        }
    });
}