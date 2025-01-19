import { mergeStyleSets } from "@fluentui/react"
import { IColumn } from "@talxis/client-libraries";

export const getGridCellLabelStyles = (columnAlignment: IColumn['alignment']) => {
    return mergeStyleSets({
        root: {
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            paddingLeft: 10,
            paddingRight: 10,
            justifyContent: getJustifyContent(columnAlignment),
            gap: 10,
        },
        fileWrapper: {
            display: 'flex',
            gap: 3,
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        contentWrapper: {
            flexGrow: 1,
            textAlign: columnAlignment,
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        fileImage: {
            marginRight: 5,
            flexShrink: 0,
            'img': {
                width: 32
            }
        },
        link: {
            maxWidth: '100%',
            //overflow: 'hidden',
            //textOverflow: 'ellipsis',
        },
        icon: {
            'img': {
                width: 20
            }
        }
    })
}

export const getDefaultContentRendererStyles = () => {
    return mergeStyleSets({
        content: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flexGrow: 1
        }
    });
}

const getJustifyContent = (columnAlignment: IColumn['alignment']) => {
    switch (columnAlignment) {
        case 'left': {
            return 'flex-start';
        }
        case 'center': {
            return 'center';
        }
        case 'right': {
            return 'flex-end';
        }
    }
}