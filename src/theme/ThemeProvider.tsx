import React, { useContext, useMemo } from "react";
import { ITheme, ThemeContext as FluentThemeContext } from "@fluentui/react";
import { getClassNames } from "@utils/styling";
import { ThemeContext } from "./ThemeContext";
import { createThemeBuilder } from "./theme-builder";
import { getThemeProviderStyles } from "./styles";

export interface IThemeProviderProps extends React.HTMLAttributes<HTMLDivElement> {
    /** The theme above, or the default theme, where left out; nothing is merged into it. */
    theme?: ITheme;
    /** What a callout, menu or tooltip opened in here is drawn in, where the theme itself is not it. */
    surfaceTheme?: ITheme;
    /** Whether the element it renders is painted in the theme's surface. */
    applyTo?: 'element' | 'none';
    children?: React.ReactNode;
}

/**
 * An element painted in a theme, and everything inside it drawn in it.
 *
 * This is the one to reach for: the theme goes through as it came rather than being deep-merged into the
 * one above, and {@link ThemeContext} hands it to Fluent from a cache rather than per instance, which is
 * what makes it cheap enough for a grid cell. It has no `applyTo='body'`.
 */
export const ThemeProvider = React.forwardRef<HTMLDivElement, IThemeProviderProps>((props, ref) => {
    const { theme: themeProp, surfaceTheme, applyTo = 'element', className, children, ...divProps } = props;
    const themeAbove = useContext(FluentThemeContext);
    const theme = themeProp ?? themeAbove ?? createThemeBuilder().getTheme();
    const styles = useMemo(() => getThemeProviderStyles(theme), [theme]);

    return <div
        ref={ref}
        {...divProps}
        className={getClassNames([className, applyTo === 'element' ? styles.themeProvider : undefined])}>
        <ThemeContext theme={theme} surfaceTheme={surfaceTheme}>{children}</ThemeContext>
    </div>;
});
ThemeProvider.displayName = 'ThemeProvider';
