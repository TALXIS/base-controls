import { ITheme, mergeStyleSets, keyframes } from "@fluentui/react";

const shimmer = keyframes({
    '100%': {
      backgroundPosition: '150px 0'
    },
  });

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
        },
        loadingLine: {
            height: 7,
            borderRadius: 5,
            width: '100%',
            animation: `${shimmer} 2s infinite`,
            backgroundSize: '1000px 100%',
            background: `linear-gradient(to right, color-mix(in oklab, ${theme.palette.white}, ${theme.palette.black} 8%) 4%, color-mix(in oklab, ${theme.palette.white}, ${theme.palette.black} 5%) 25%, color-mix(in oklab, ${theme.palette.white}, ${theme.palette.black} 8%) 36%)`
        }
    })
}