import { ITheme, keyframes, mergeStyleSets, SpinnerLabelPosition, SpinnerSize } from "@fluentui/react";

//Fluent UI 9's extra-tiny, tiny, medium and large spinners
const SIZES: Record<SpinnerSize, { diameter: number; stroke: number; fontSize: number; gap: number }> = {
    [SpinnerSize.xSmall]: { diameter: 16, stroke: 2, fontSize: 14, gap: 4 },
    [SpinnerSize.small]: { diameter: 20, stroke: 2, fontSize: 14, gap: 4 },
    [SpinnerSize.medium]: { diameter: 32, stroke: 3, fontSize: 16, gap: 8 },
    [SpinnerSize.large]: { diameter: 36, stroke: 3, fontSize: 16, gap: 8 },
};

const DIRECTIONS: Record<SpinnerLabelPosition, 'column' | 'column-reverse' | 'row' | 'row-reverse'> = {
    bottom: 'column',
    top: 'column-reverse',
    right: 'row',
    left: 'row-reverse',
};

const DURATION = '1.5s';
//Fluent UI 9's curveEasyEase
const EASE = 'cubic-bezier(0.33, 0, 0.67, 1)';

const rotate = (degrees: number) => ({ transform: `rotate(${degrees}deg)` });
const SPIN = keyframes({ '0%': rotate(0), '100%': rotate(360) });
//the tail swings ahead, and its two halves open and close against each other, so the arc grows and shrinks
const TAIL = keyframes({ '0%': rotate(-135), '50%': rotate(0), '100%': rotate(225) });
const TAIL_START = keyframes({ '0%': rotate(0), '50%': rotate(105), '100%': rotate(0) });
const TAIL_END = keyframes({ '0%': rotate(0), '50%': rotate(225), '100%': rotate(0) });

export const getSpinnerStyles = (theme: ITheme, spinnerSize: SpinnerSize, labelPosition: SpinnerLabelPosition) => {
    const size = SIZES[spinnerSize];
    const ring = `radial-gradient(closest-side, transparent calc(100% - ${size.stroke}px - 1px), white calc(100% - ${size.stroke}px) calc(100% - 1px), transparent 100%)`;
    const half = { content: '""', position: 'absolute', inset: 0, backgroundImage: 'conic-gradient(currentcolor 135deg, transparent 135deg)', animationDuration: DURATION, animationIterationCount: 'infinite', animationTimingFunction: EASE } as const;
    return mergeStyleSets({
        root: {
            display: 'inline-flex',
            flexDirection: DIRECTIONS[labelPosition],
            alignItems: 'center',
            justifyContent: 'center',
            gap: size.gap,
        },
        track: {
            position: 'relative',
            flexShrink: 0,
            width: size.diameter,
            height: size.diameter,
            maskImage: ring,
            WebkitMaskImage: ring,
            backgroundColor: theme.palette.themeLight,
            color: theme.palette.themePrimary,
            animation: `${SPIN} ${DURATION} linear infinite`,
        },
        tail: {
            position: 'absolute',
            inset: 0,
            maskImage: 'conic-gradient(transparent 105deg, white 105deg)',
            WebkitMaskImage: 'conic-gradient(transparent 105deg, white 105deg)',
            animation: `${TAIL} ${DURATION} ${EASE} infinite`,
            selectors: {
                '::before': { ...half, animationName: TAIL_START },
                '::after': { ...half, animationName: TAIL_END },
            },
        },
        label: {
            color: theme.semanticColors.bodyText,
            fontFamily: theme.fonts.medium.fontFamily,
            fontSize: size.fontSize,
            lineHeight: 1.4,
        },
    });
};
