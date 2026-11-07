import { ITheme, mergeStyleSets } from "@fluentui/react";

const DEFAULT_MAP_HEIGHT = 400;

export const getMapUiSkeletonStyles = (theme: ITheme, hasFixedHeight: boolean) => {
    return mergeStyleSets({
        map: {
            position: 'relative',
            overflow: 'hidden',
            ...(hasFixedHeight ? { flexGrow: 1, height: 0 } : { height: DEFAULT_MAP_HEIGHT }),
        },
        drawing: {
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
        },
        region: {
            fill: theme.palette.neutralQuaternaryAlt,
            opacity: 0.5,
        },
        road: {
            fill: 'none',
            stroke: theme.semanticColors.bodyBackground,
            strokeLinecap: 'round',
            opacity: 0.7,
        },
        pin: {
            fill: theme.palette.neutralTertiaryAlt,
        },
        pinDot: {
            fill: theme.semanticColors.bodyBackground,
        },
        zoom: {
            position: 'absolute',
            top: 10,
            left: 10,
            width: 30,
            height: 60,
            boxSizing: 'border-box',
            borderRadius: 4,
            backgroundColor: theme.semanticColors.bodyBackground,
            opacity: 0.7,
        },
    });
};
