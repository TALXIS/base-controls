import { ITheme, keyframes, mergeStyleSets } from '@fluentui/react';

const HEADER_HEIGHT = 64;
const COLUMN_HEADER_HEIGHT = 42;
const ROW_HEIGHT = 42;
const FOOTER_HEIGHT = 44;

export const getSkeletonStyles = (theme: ITheme) => {
    const shimmerKeyframe = keyframes({
        '0%': { backgroundPosition: '-600px 0' },
        '100%': { backgroundPosition: '600px 0' },
    });

    const shimmerBase = {
        background: `linear-gradient(90deg, ${theme.semanticColors.disabledBackground} 25%, ${theme.palette.neutralLight} 50%, ${theme.semanticColors.disabledBackground} 75%)`,
        backgroundSize: '1200px 100%',
        animationName: shimmerKeyframe,
        animationDuration: '1.5s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
        borderRadius: 2,
    };

    return mergeStyleSets({
        root: {
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.semanticColors.bodyBackground,
        },
        header: {
            height: HEADER_HEIGHT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 8px',
            borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`,
            flexShrink: 0,
        },
        headerLeft: {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
        },
        headerRight: {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
        },
        headerPill: {
            ...shimmerBase,
            height: 26,
            borderRadius: 2,
            flexShrink: 0,
        },
        columnHeaderRow: {
            height: COLUMN_HEADER_HEIGHT,
            display: 'flex',
            alignItems: 'center',
            borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`,
            flexShrink: 0,
        },
        columnCell: {
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px',
            minWidth: 0,
        },
        shimmerLine: {
            ...shimmerBase,
            height: 11,
            borderRadius: 2,
        },
        checkboxShimmer: {
            ...shimmerBase,
            width: 16,
            height: 16,
            borderRadius: 2,
            flexShrink: 0,
        },
        rows: {
            flexGrow: 1,
            overflow: 'auto',
            height: 0
        },
        row: {
            height: ROW_HEIGHT,
            display: 'flex',
            alignItems: 'center',
            borderBottom: `1px solid ${theme.semanticColors.bodyDivider}`,
        },
        footer: {
            height: FOOTER_HEIGHT,
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px',
            borderTop: `1px solid ${theme.semanticColors.bodyDivider}`,
            flexShrink: 0,
        },
    });
};
