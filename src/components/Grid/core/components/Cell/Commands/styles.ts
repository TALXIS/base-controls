import { ITheme, keyframes, mergeStyleSets } from "@fluentui/react";

export const commandStyles = mergeStyleSets({
    root: {
        backgroundColor: 'transparent'
    },
    talxisRoot: {
        minWidth: 0,
        flexShrink: 1,
        flexGrow: 1
    },
    button: {
        backgroundColor: 'transparent',
    },
    icon: {
        width: 16,
        height: 16,
        marginLeft: 4,
        marginRight: 4,
    }
});

const loadingLineAnimation = keyframes({
    '0%': {
        backgroundPosition: '-100px 0',
    },
    '100%': {
        backgroundPosition: '100px 0'
    }
})

export const getCommandsLoadingStyles = (theme: ITheme) => {
    return mergeStyleSets({
        loading: {
            overflow: 'hidden',
            padding: 15,
            flex: 1,
            display: 'grid',
            alignItems: 'center',
            gridTemplateColumns: 'repeat(3, minmax(0px, 100px))',
            gap: 15,
            justifyContent: 'flex-start',
          },
          loadingLine: {
            height: 10,
            borderRadius: 5,
            width: '100%',
            animation: `${loadingLineAnimation} 2s infinite`,
            backgroundSize: '1000px 100%',
            background: `linear-gradient(to right, color-mix(in oklab, ${theme.palette.white}, ${theme.palette.black} 8%) 4%, color-mix(in oklab, ${theme.palette.white}, ${theme.palette.black} 5%) 25%, color-mix(in oklab, ${theme.palette.white}, ${theme.palette.black} 8%) 36%)`
          },
    })
}