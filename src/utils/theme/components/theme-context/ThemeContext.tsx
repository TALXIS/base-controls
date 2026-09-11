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
 * A cheap `ThemeProvider` for a theme that is already whole, which is what to reach for when many of them
 * are rendered at once - a themed grid cell being the case it was written for. `ThemeProvider` deep-merges
 * the theme into the one above it, builds the customizations a `styled()` component reads, and resolves a
 * class to paint with, all memoised per instance, so two hundred cells pay for all three two hundred times.
 * Here the theme goes through as it came, the customizations are cached per theme, and nothing is painted.
 * Measured over two hundred cells: ~17ms against ~1ms.
 */
export const ThemeContext = (props: IThemeContextProps) => {
    const { theme, children } = props;

    //both contexts, because a v8 component reads its theme from whichever it was written against:
    //`useTheme` takes `ThemeContext`, and everything built with `styled()` takes `CustomizerContext`
    return <FluentThemeContext.Provider value={theme}>
        <CustomizerContext.Provider value={getThemeCustomizations(theme)}>{children}</CustomizerContext.Provider>
    </FluentThemeContext.Provider>;
};
