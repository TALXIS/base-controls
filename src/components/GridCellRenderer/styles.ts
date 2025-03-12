import { mergeStyleSets } from "@fluentui/react"
import { DataType, IColumn } from "@talxis/client-libraries";
import { ITheme } from "@talxis/react-components";

export const getGridCellLabelStyles = (columnAlignment: IColumn['alignment'], dataType: DataType, rowHeight: number, theme: ITheme) => {
    return mergeStyleSets({
        root: {
            display: 'flex',
            alignItems: 'center',
            height: rowHeight,
            paddingLeft: 8,
            paddingRight: 8,
            justifyContent: getJustifyContent(columnAlignment),
            gap: 10,
        },
        fileWrapper: {
            display: 'flex',
            gap: 5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            alignItems: 'center'
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
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            ...(isMultiple(dataType) ? getMultilineStyles(rowHeight, theme) : {})
        },
        icon: {
            'img': {
                width: 20
            }
        },
        fileIcon: {
            fontSize: 18
        },
        loadingSpinnerCircle: {
            width: 20,
            height: 20
        }
    })
}
export const getDefaultContentRendererStyles = (theme: ITheme, dataType: DataType, rowHeight: number) => {
    return mergeStyleSets({
        content: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flexGrow: 1,
            ...(isMultiple(dataType) ? getMultilineStyles(rowHeight, theme) : {})
        },
        placeholder: {
            color: theme.semanticColors.inputPlaceholderText
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

const getMultilineStyles = (rowHeight: number, theme: ITheme) => {
    let fontSize = 20;
    const themeFontSize = theme.fonts.medium.fontSize;
    theme.fonts.medium.lineHeight
    if(typeof themeFontSize === 'number') {
        fontSize = themeFontSize;
    }
    else if(typeof themeFontSize === 'string' && themeFontSize.endsWith('px')) {
        fontSize = parseInt(themeFontSize.replace('px', ''));
    }
    const clamp = Math.floor(rowHeight / fontSize) - 1;
    return {
        lineHeight: '1.2',
        display: '-webkit-box',
        whiteSpace: 'normal',
        '-webkit-box-orient': 'vertical',
        wordBreak: 'break-all',
        '-webkit-line-clamp': clamp.toString(),
    };
}

const isMultiple = (dataType: DataType) => {
    return dataType === 'Multiple' || dataType === 'SingleLine.TextArea';
}
