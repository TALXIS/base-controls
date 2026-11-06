import { ITheme, keyframes, mergeStyleSets } from "@fluentui/react";

const POP = keyframes({
    '0%': { transform: 'scale(0.6)' },
    '60%': { transform: 'scale(1.15)' },
    '100%': { transform: 'scale(1)' },
});

//Fluent's `Check` reads hover off this class on its parent, and does not export it
export const CHECK_HOST_CLASS_NAME = 'ms-Check-checkHost';

export const getCompletionCheckboxStyles = (theme: ITheme) => mergeStyleSets({
    root: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        padding: 0,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        selectors: {
            ':disabled': {
                cursor: 'default',
                opacity: 0.6,
            },
            ':hover:not(:disabled) .ms-Check-check': {
                opacity: 1,
            },
            ':focus-visible': {
                outline: `1px solid ${theme.palette.neutralSecondary}`,
                outlineOffset: -2,
            },
        },
    },
    popped: {
        animationName: POP,
        animationDuration: '0.25s',
        animationTimingFunction: 'ease-out',
    },
});
