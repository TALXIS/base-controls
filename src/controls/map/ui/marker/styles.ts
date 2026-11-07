import { ITheme, mergeStyleSets } from "@fluentui/react";

export const MAP_UI_MARKER_WIDTH = 32;
export const MAP_UI_MARKER_HEIGHT = 40;
const DOT_SIZE = 10;

export const getMapUiMarkerStyles = (theme: ITheme) => {
    return mergeStyleSets({
        container: {
            position: 'relative',
            width: MAP_UI_MARKER_WIDTH,
            height: MAP_UI_MARKER_HEIGHT,
            cursor: 'pointer',
            transformOrigin: 'bottom center',
            transition: 'transform 150ms cubic-bezier(0.33, 0, 0.67, 1)',
            selectors: {
                ':hover': {
                    transform: 'translateY(-2px) scale(1.08)',
                },
            },
        },
        dot: {
            width: DOT_SIZE,
            height: DOT_SIZE,
            borderRadius: '50%',
            background: theme.palette.white,
        },
    });
};
