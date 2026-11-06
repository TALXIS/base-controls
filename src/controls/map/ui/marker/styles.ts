import { ITheme, mergeStyleSets } from "@fluentui/react";

export const MAP_UI_MARKER_WIDTH = 32;
export const MAP_UI_MARKER_HEIGHT = 40;
const PIN_SIZE = 28;
const DOT_SIZE = 10;

export const getMapUiMarkerStyles = (theme: ITheme, color?: string) => {
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
        pin: {
            position: 'absolute',
            //puts the rotated square's sharp corner, half a diagonal below its centre, on the bottom edge
            left: (MAP_UI_MARKER_WIDTH - PIN_SIZE) / 2,
            top: MAP_UI_MARKER_HEIGHT - PIN_SIZE / 2 - PIN_SIZE * Math.SQRT1_2,
            width: PIN_SIZE,
            height: PIN_SIZE,
            boxSizing: 'border-box',
            borderRadius: '50% 50% 50% 0',
            transform: 'rotate(-45deg)',
            background: color ?? theme.palette.themePrimary,
            border: `2px solid ${theme.palette.white}`,
            boxShadow: theme.effects.elevation8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        dot: {
            width: DOT_SIZE,
            height: DOT_SIZE,
            borderRadius: '50%',
            background: theme.palette.white,
        },
    });
};
