import { ITheme, mergeStyleSets, keyframes } from "@fluentui/react";

const shimmer = keyframes({
    '100%': {
        backgroundPosition: '150px 0'
    },
});



export const getReadOnlyCellStyles = (theme: ITheme) => {
    return mergeStyleSets({
        loading: {
            height: '100%',
            alignItems: 'center',
            display: 'flex',
            '.ms-Shimmer-shimmerWrapper': {
                height: 10
            }
        },
        root: {
            display: 'flex',
            height: '100%',
            alignItems: 'center',
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
            flex: 1,
            display: 'flex',
            overflow: 'hidden',
            alignItems: 'center',
            height: '100%',
        },
        cellContentWrapper: {
            display: 'flex',
            height: '100%',
            alignItems: 'center',
            overflow: 'hidden',
            flexShrink: 1,
            flexGrow: 0,
            ':global(.talxis-cell-align-right &)': {
                order: 2
            },
            ':only-child': {
                flexGrow: 1
            }
        },
        uneditableNotification: {
            'i': {
                color: `${theme.semanticColors.infoIcon} !important`
            }
        },
        notificationsWrapper: {
            display: 'flex',
            flexGrow: 1,
            flexShrink: 0,
            flexBasis: 0,
            justifyContent: 'flex-end',
            minWidth: 'var(--test, 0px)',
            alignItems: 'center',
            overflow: 'hidden',
            ':global(.talxis-cell-align-right &)': {
                order: 1,
                justifyContent: 'flex-start',
                '.ms-CommandBar .ms-CommandBar-primaryCommand': {
                    justifyContent: 'flex-start'
                }
            }
        },
        notifications: {
            minWidth: 0,
            flex: 1,
            ':global(.talxis-cell-align-right &)': {
                order: 2
            }
        },
        loadingLine: {
            height: 7,
            borderRadius: 5,
            width: '100%',
            animation: `${shimmer} 2s infinite`,
            backgroundSize: '1000px 100%',
            background: `linear-gradient(to right, color-mix(in oklab, ${theme.palette.white}, ${theme.palette.black} 8%) 4%, color-mix(in oklab, ${theme.palette.white}, ${theme.palette.black} 5%) 25%, color-mix(in oklab, ${theme.palette.white}, ${theme.palette.black} 8%) 36%)`
        },
    })
}