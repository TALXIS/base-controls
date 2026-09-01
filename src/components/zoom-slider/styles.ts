import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getZoomSliderStyles = (theme: ITheme, disabled?: boolean) => {
    return mergeStyleSets({
        root: {
            minWidth: 220,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            pointerEvents: disabled ? 'none' : 'auto',
            '.ms-Slider': {
                marginBottom: 0,
            },
            '.ms-Slider-label': {
                color: disabled ? theme.semanticColors.disabledBodyText : theme.semanticColors.bodyText,
                fontWeight: 600,
            }
        },
        slider: {
            flexGrow: 1,
        },
        zoomButton: {
            visibility: disabled ? 'hidden' : 'visible',
            width: 22,
            height: 22,
            'i': {
                fontSize: 12
            }
        },
        thumb: {
            borderRadius: '50%',
            width: 22,
            height: 22,
            top: -8,
            border: 'none !important',
            boxShadow: disabled ? 'none' : theme.effects.elevation16,
            backgroundColor: disabled ? theme.semanticColors.disabledBackground : theme.palette.themePrimary,
            '::after': {
                content: '""',
                display: 'block',
                width: 13,
                height: 13,
                position: 'absolute',
                top: 11.5,
                left: 11.5,
                transform: 'translate(-50%, -50%)',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Ccircle cx='8' cy='8' r='5.5' stroke='${disabled ? '%23605e5c' : 'white'}' stroke-width='2.5' fill='none'/%3E%3Cline x1='12.5' y1='12.5' x2='15.5' y2='15.5' stroke='${disabled ? '%23605e5c' : 'white'}' stroke-width='2.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
            }
        },
        activeSection: {
            backgroundColor: `${disabled ? theme.semanticColors.disabledBackground : theme.palette.themePrimary} !important`,
        }
    });
}