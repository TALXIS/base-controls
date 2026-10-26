import { ITheme, keyframes, mergeStyleSets } from "@fluentui/react";

export const getGanttSkeletonStyles = () => mergeStyleSets({
    root: {
        position: 'absolute',
        inset: 0,
        zIndex: 11,
    },
});

export const getGanttSkeletonShimmerStyles = (theme: ITheme, scaleHeight: number, rowHeight: number, columnWidth: number) => {
    const divider = `1px solid ${theme.semanticColors.bodyDivider}`;
    const shimmerKeyframe = keyframes({
        '0%': { backgroundPosition: '-600px 0' },
        '100%': { backgroundPosition: '600px 0' },
    });
    //the dataset control's skeleton shimmer, so the two pulse together
    const shimmer = {
        background: `linear-gradient(90deg, ${theme.semanticColors.disabledBackground} 25%, ${theme.palette.neutralLight} 50%, ${theme.semanticColors.disabledBackground} 75%)`,
        backgroundSize: '1200px 100%',
        animationName: shimmerKeyframe,
        animationDuration: '1.5s',
        animationTimingFunction: 'linear',
        animationIterationCount: 'infinite',
    };

    return mergeStyleSets({
        skeleton: {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            backgroundColor: theme.semanticColors.bodyBackground,
        },
        scale: {
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            height: scaleHeight,
            borderBottom: divider,
            boxSizing: 'border-box',
        },
        scaleLine: {
            display: 'flex',
            flex: '1 1 0',
            minHeight: 0,
            selectors: {
                '& + &': { borderTop: divider },
            },
        },
        scaleCell: {
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            boxSizing: 'border-box',
            borderRight: divider,
        },
        spanLabel: {
            ...shimmer,
            height: 8,
            marginLeft: 10,
            borderRadius: 2,
        },
        unitLabel: {
            ...shimmer,
            width: 22,
            height: 7,
            margin: '0 auto',
            borderRadius: 2,
        },
        body: {
            flex: '1 1 0',
            minHeight: 0,
            backgroundImage: `repeating-linear-gradient(to right, transparent 0 ${columnWidth - 1}px, ${theme.semanticColors.bodyDivider} ${columnWidth - 1}px ${columnWidth}px)`,
        },
        row: {
            position: 'relative',
            height: rowHeight,
            borderBottom: divider,
            boxSizing: 'border-box',
        },
        bar: {
            ...shimmer,
            position: 'absolute',
            top: '50%',
            height: 20,
            transform: 'translateY(-50%)',
            borderRadius: theme.effects.roundedCorner4,
        },
        summaryBar: {
            height: 8,
        },
        milestone: {
            width: 14,
            height: 14,
            borderRadius: 2,
            transform: 'translate(-50%, -50%) rotate(45deg)',
        },
    });
};
