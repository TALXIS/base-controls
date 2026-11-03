import React, { useContext } from "react";
import { ThemeContext as FluentThemeContext } from "@fluentui/react";
import { AppThemeContext } from "./ThemeContext";
import { IThemeProviderProps, ThemeProvider } from "./ThemeProvider";
import { createThemeBuilder } from "./theme-builder";

/** The application's theme, which dialogs, menus and other surfaces are drawn in. */
export const AppThemeProvider = React.forwardRef<HTMLDivElement, IThemeProviderProps>((props, ref) => {
    const themeAbove = useContext(FluentThemeContext);
    const theme = props.theme ?? themeAbove ?? createThemeBuilder().getTheme();

    return <AppThemeContext.Provider value={theme}>
        <ThemeProvider ref={ref} {...props} theme={theme} />
    </AppThemeContext.Provider>;
});
AppThemeProvider.displayName = 'AppThemeProvider';
