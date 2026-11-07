import { ITheme, mergeStyleSets } from "@fluentui/react";
import { MAP_UI_MARKER_HEIGHT, MAP_UI_MARKER_WIDTH } from "../marker/styles";

const PIN_SIZE = 28;

export const getMapUiMarkerPinStyles = (theme: ITheme, color?: string) => {
    return mergeStyleSets({
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
    });
};
