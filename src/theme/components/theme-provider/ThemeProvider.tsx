import React, { useMemo } from "react";
import { ITheme } from "@fluentui/react";
import { getClassNames } from "@utils";
import { ThemeContext } from "../theme-context";
import { getCachedThemeProviderStyles } from "./styles";

export interface ICachedThemeProviderProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Whole, rather than the partial `ThemeProvider` allows: nothing is merged into it. */
    theme: ITheme;
    /** Whether the element it renders is painted in the theme's surface. */
    applyTo?: 'element' | 'none';
    children?: React.ReactNode;
}

/**
 * An element painted in a theme, and everything inside it themed by it.
 *
 * `ThemeProvider` for a theme that is already whole, which is what to reach for where many of them are
 * rendered at once: the theme goes through as it came rather than being deep-merged into the one above,
 * and the contexts come from {@link ThemeContext}, which caches the customizations per theme rather than
 * building a context value per instance.
 *
 * What it does not do is `applyTo='body'`, which paints the document rather than what is rendered here.
 */
export const CachedThemeProvider = React.forwardRef<HTMLDivElement, ICachedThemeProviderProps>((props, ref) => {
    const { theme, applyTo = 'element', className, children, ...divProps } = props;
    const styles = useMemo(() => getCachedThemeProviderStyles(theme), [theme]);

    return <div
        ref={ref}
        {...divProps}
        className={getClassNames([className, applyTo === 'element' ? styles.root : undefined])}>
        <ThemeContext theme={theme}>{children}</ThemeContext>
    </div>;
});
CachedThemeProvider.displayName = 'CachedThemeProvider';
