import { ITheme, keyframes, mergeStyleSets } from "@fluentui/react";

export const errorOpacityAnim = keyframes({
    '0%': {
        opacity: 0
    },
    '100%': {
        opacity: 1
    }
});

export const errorTransformAnim = keyframes({
    '0%': {
        transform: 'translate3d(0px, -20px, 0px)',
        pointerEvents: 'none'
    },
    '100%': {
        transform: 'translate3d(0px, 0px, 0px)',
        pointerEvents: 'auto'
    }
});

export const getErrorMessageStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            animationName: `${errorOpacityAnim}, ${errorTransformAnim}`,
            animationDuration: '0.367s',
            animationTimingFunction: 'ease-in-out',
            animationFillMode: 'both',
            WebkitFontSmoothing: 'antialiased',
            fontSize: '12px',
            fontWeight: 400,
            color: theme.semanticColors.errorText,
            margin: 0,
            paddingTop: '5px',
            display: 'flex',
            alignItems: 'center'
        }
    });
};