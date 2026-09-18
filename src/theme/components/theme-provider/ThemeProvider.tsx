import React, { useMemo } from "react";
import { ITheme } from "@fluentui/react";
import { getClassNames } from "@utils/styling";
import { ThemeContext } from "../theme-context";
import { getThemeProviderStyles } from "./styles";

export interface IThemeProviderProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Whole, rather than the partial Fluent's allows: nothing is merged into it. */
    theme: ITheme;
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
    const { theme, surfaceTheme, applyTo = 'element', className, children, ...divProps } = props;
    const styles = useMemo(() => getThemeProviderStyles(theme), [theme]);

    return <div
        ref={ref}
        {...divProps}
        className={getClassNames([className, applyTo === 'element' ? styles.root : undefined])}>
        <ThemeContext theme={theme} surfaceTheme={surfaceTheme}>{children}</ThemeContext>
    </div>;
});
ThemeProvider.displayName = 'ThemeProvider';
