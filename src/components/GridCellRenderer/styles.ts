import { mergeStyleSets } from "@fluentui/react"

export const getGridCellLabelStyles = (columnAlignment: 'left' | 'center' | 'right') => {
    return mergeStyleSets({
        root: {
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            paddingLeft: 10,
            paddingRight: 10,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            justifyContent: getJustifyContent(columnAlignment)
        },
        fileWrapper: {
            display: 'flex',
            gap: 3,
            overflow: 'hidden'
        },
        fileImage: {
            marginRight: 5,
            flexShrink: 0,
            'img': {
                width: 32
            }
        },
        link: {
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        }
    })
}

export const getDefaultContentRendererStyles = () => {
    return mergeStyleSets({
        content: {
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        }
    });
}

const getJustifyContent = (columnAlignment: 'left' | 'center' | 'right') => {
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