import { mergeStyleSets } from "@fluentui/react"
import { DataType, IColumn } from "@talxis/client-libraries";
import { ITheme } from "@talxis/react-components";

export const getGridCellLabelStyles = (columnAlignment: IColumn['alignment'], dataType: DataType, rowHeight: number, theme: ITheme) => {
    return mergeStyleSets({
        root: {
            height: '100%',
            paddingLeft: 8,
            paddingRight: 8,
            display: 'flex',
            flexDirection: 'column'
        },
        aggregationLabel: {
            lineHeight: 6,
            textAlign: columnAlignment,
            color: theme.semanticColors.infoIcon,
            fontSize: 12,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        prefixSuffixContentWrapper: {
            display: 'flex',
            flexGrow: 1,
            alignItems: 'center',
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
            resize: isMultiple(dataType) ? 'vertical' : 'none',
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
    return {
        lineHeight: '1.2',
        display: '-webkit-box',
        whiteSpace: 'normal',
        '-webkit-box-orient': 'vertical',
        wordBreak: 'break-all',
        '-webkit-line-clamp': '6',
    }
}

const isMultiple = (dataType: DataType) => {
    return dataType === 'Multiple' || dataType === 'SingleLine.TextArea';
}
