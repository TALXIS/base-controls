import { ICustomizerContext, ITheme } from "@fluentui/react";

/**
 * What a v8 component reads its theme through, for one theme.
 *
 * Kept per theme rather than per cell: `ThemeProvider` builds this in a `useMemo` and deep-merges a theme
 * alongside it, so a grid drawing two hundred cells pays for both two hundred times. A grid draws from a
 * handful of themes.
 *
 * By id where a theme carries one, because an id is the promise that the same id means the same theme:
 * a hook handing back an equal theme in a new object each render then still gets the same context back,
 * and the cells under it are not re-rendered for it. Without one there is nothing to compare but the
 * object, and a `WeakMap` lets those go when the themes do.
 */
const contextsById = new Map<string, ICustomizerContext>();
const contextsByInstance = new WeakMap<ITheme, ICustomizerContext>();

/** The customizations a cell's theme reaches `styled()` components through. */
export const getCellCustomizerContext = (theme: ITheme): ICustomizerContext => {
    const cache = theme.id ? contextsById : contextsByInstance;
    const key: any = theme.id ?? theme;
    let context = cache.get(key);
    if (!context) {
        context = { customizations: { inCustomizerContext: true, settings: { theme: theme }, scopedSettings: theme.components ?? {} } };
        cache.set(key, context);
    }
    return context;
};
