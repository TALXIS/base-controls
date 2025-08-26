import React from 'react';
import { ThemeProvider, ThemeProviderProps } from '@fluentui/react';
import { useControlTheme } from '../hooks';

interface IThemeWrapper extends ThemeProviderProps {
    fluentDesignLanguage?: ComponentFramework.FluentDesignState;
    children?: React.ReactNode;
}

export const ThemeWrapper = (props: IThemeWrapper) => {
    const theme = useControlTheme(props.fluentDesignLanguage);
    return (
        <ThemeProvider theme={theme} {...props}>
            {props.children}
        </ThemeProvider>
    );
};