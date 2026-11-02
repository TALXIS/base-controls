import React, { useContext } from "react";
import { CustomizerContext, ICustomizerContext, ITheme, ThemeContext as FluentThemeContext, useTheme } from "@fluentui/react";
import { createThemeBuilder } from "./theme-builder";

//what a thing opened over the application is drawn in, where that is not what it was opened from
export const SurfaceThemeContext = React.createContext<ITheme | undefined>(undefined);

export interface IThemeContextProps {
    /** The theme above, or the default theme, where left out; nothing is merged into it. */
    theme?: ITheme;
    /** What a callout, menu or tooltip opened in here is drawn in, where the theme itself is not it. */
    surfaceTheme?: ITheme;
    children?: React.ReactNode;
}

/**
 * The theme everything drawn inside it is themed by, without drawing anything itself.
 *
 * For a theme that is already whole: it goes through as it came, nothing is merged into it and nothing is
 * painted, and the customizations a `styled()` component reads are cached per theme rather than built per
 * instance. That is the whole of it, and it is what makes it cheap enough to render per grid cell -
 * `ThemeProvider` does all three per instance, measured at ~17ms against ~1ms over two hundred cells.
 *
 * Wanting an element painted in the theme is `ThemeProvider`, which is this with one rendered.
 */
export const ThemeContext = (props: IThemeContextProps) => {
    const { children } = props;
    const themeAbove = useContext(FluentThemeContext);
    const theme = props.theme ?? themeAbove ?? createThemeBuilder().getTheme();
    //inherited where none is given: a theme set in here says nothing about what the application looks like
    const surfaceThemeAbove = useContext(SurfaceThemeContext);
    const themeAround = useTheme();
    const surfaceTheme = props.surfaceTheme ?? surfaceThemeAbove ?? themeAround;

    //both contexts, because a v8 component reads its theme from whichever it was written against:
    //`useTheme` takes `ThemeContext`, and everything built with `styled()` takes `CustomizerContext`
    return <FluentThemeContext.Provider value={theme}>
        <CustomizerContext.Provider value={getThemeCustomizations(theme)}>
            <SurfaceThemeContext.Provider value={surfaceTheme}>{children}</SurfaceThemeContext.Provider>
        </CustomizerContext.Provider>
    </FluentThemeContext.Provider>;
};

/**
 * What a v8 component reads its theme through, for one theme.
 *
 * Kept per theme rather than per provider: `ThemeProvider` builds this in a `useMemo` and deep-merges a theme
 * alongside it, so a grid drawing two hundred cells pays for both two hundred times. A grid draws from a
 * handful of themes.
 *
 * Cached rather than rebuilt because it is a context value: a new object every render re-renders every
 * component under it, however equal the two are.
 *
 * By id where a theme carries one, because an id is the promise that the same id means the same theme: a
 * theme rebuilt into a new object each render then still gets the same context back. Without one there is
 * nothing to compare but the object, and a `WeakMap` lets those go when the themes do.
 */
const customizationsById = new Map<string, ICustomizerContext>();
const customizationsByInstance = new WeakMap<ITheme, ICustomizerContext>();

/** The customizations a theme reaches `styled()` components through. */
const getThemeCustomizations = (theme: ITheme): ICustomizerContext => {
    const cache = theme.id ? customizationsById : customizationsByInstance;
    const key: any = theme.id ?? theme;
    let customizations = cache.get(key);
    if (!customizations) {
        //what `useThemeProviderState` puts there: `inCustomizerContext` keeps a component off the global
        //`Customizations` singleton, and `scopedSettings` is how a theme carries per-component overrides
        customizations = { customizations: { inCustomizerContext: true, settings: { theme: theme }, scopedSettings: theme.components ?? {} } };
        cache.set(key, customizations);
    }
    return customizations;
};
