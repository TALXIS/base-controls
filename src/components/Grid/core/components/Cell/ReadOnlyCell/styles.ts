import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getReadOnlyCellStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            display: 'flex',
            height: '100%',
            alignItems: 'center',
            gap: 10
        },
        text: {
            fontSize: 14,
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        link: {
            fontSize: 14,
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        fileWrapper: {
            display: 'flex',
            gap: 3
        },
        image: {
            marginRight: 5,
            'img': {
                width: 32
            }
        },
        cellContent: {
            display: 'flex',
            height: '100%',
            alignItems: 'center',
            flexGrow: 1,
            overflow: 'hidden',
            ':has([data-align="right"])': {
                justifyContent: 'flex-end',
            }
        }
    })
}