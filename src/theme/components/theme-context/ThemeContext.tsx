import React from "react";
import { CustomizerContext, ITheme, ThemeContext as FluentThemeContext } from "@fluentui/react";
import { getThemeCustomizations } from "./getThemeCustomizations";

export interface IThemeContextProps {
    /** Whole, rather than the partial `ThemeProvider` allows: nothing is merged into it. */
    theme: ITheme;
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
 * Wanting an element painted in the theme is `CachedThemeProvider`, which is this with one rendered.
 */
export const ThemeContext = (props: IThemeContextProps) => {
    const { theme, children } = props;

    //both contexts, because a v8 component reads its theme from whichever it was written against:
    //`useTheme` takes `ThemeContext`, and everything built with `styled()` takes `CustomizerContext`
    return <FluentThemeContext.Provider value={theme}>
        <CustomizerContext.Provider value={getThemeCustomizations(theme)}>{children}</CustomizerContext.Provider>
    </FluentThemeContext.Provider>;
};
