import { ICustomizerContext, ITheme } from "@fluentui/react";

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
export const getThemeCustomizations = (theme: ITheme): ICustomizerContext => {
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

