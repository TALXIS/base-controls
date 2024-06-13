import { ITheme, keyframes, mergeStyleSets } from "@fluentui/react";

const getSpinnerAnimation = (degValue: number) => {
    return keyframes({
        '0%': {
            transform: 'rotate(0deg)'
        },
        '50%': {
            transform: `rotate(${degValue}deg)`
        },
        '100%': {
            transform: 'rotate(0deg)'
        }
    })
}

const counterSpinner = keyframes({
    '0%': {
        transform: 'rotate(-135deg)'
    },
    '50%': {
        transform: `rotate(0deg)`
    },
    '100%': {
        transform: 'rotate(225deg)'
    }
})

const rotate = keyframes({
    '0%': {
        transform: 'rotate(0deg)'
    },
    '100%': {
        transform: 'rotate(360deg)'
    }
})

export const getLoadingOverlayStyles = (theme: ITheme) => {
    return mergeStyleSets({
        root: {
            borderWidth: '3px',
            position: 'relative',
            border: 'none',
            maskImage: 'radial-gradient(closest-side, transparent calc(100% - 3px), white calc(100% - 3px) calc(100% - 1px), transparent 100%)',
            backgroundColor: theme.palette.themeLighter,
            color: theme.palette.themePrimary,
            width: 36,
            height: 36,
            animationName: rotate,
            animationDuration: '1.5s',
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear'
        },
        tail: {
            position: 'absolute',
            display: 'block',
            width: '100%',
            height: '100%',
            maskImage: 'conic-gradient(transparent 105deg, white 105deg)',
            animationDuration: '1.5s',
            animationIterationCount: 'infinite',
            animationTimingFunction: 'cubic-bezier(0.33,0,0.67,1)',
            animationName: counterSpinner,
            '::after, ::before': {
                content: "''",
                position: 'absolute',
                display: 'block',
                width: '100%',
                height: '100%',
                animation: 'inherit',
                backgroundImage: 'conic-gradient(currentcolor 135deg, transparent 135deg)',
            },
            '::after': {
                animationName: getSpinnerAnimation(225),
            },
            '::before': {
                maskImage: 'inherit',
                animationName: getSpinnerAnimation(105)
            },
        }
    })
}