import React, { useEffect } from 'react';
import { ThemeProvider, ThemeProviderProps } from '@fluentui/react';
import { useControlTheme } from '../hooks';

interface IThemeWrapper extends ThemeProviderProps {
    fluentDesignLanguage?: ComponentFramework.FluentDesignState;
    children?: React.ReactNode;
}

export const ThemeWrapper: React.FC<IThemeWrapper> = (props: IThemeWrapper) => {
    const theme = useControlTheme(props.fluentDesignLanguage);
    return (
        <ThemeProvider>
            {props.children}
        </ThemeProvider>
    );
};