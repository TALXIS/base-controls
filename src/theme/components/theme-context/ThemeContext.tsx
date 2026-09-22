import React, { useContext } from "react";
import { CustomizerContext, ITheme, ThemeContext as FluentThemeContext } from "@fluentui/react";
import { SurfaceThemeContext } from "../context";
import { getThemeCustomizations } from "./getThemeCustomizations";

export interface IThemeContextProps {
    /** Whole, rather than the partial `ThemeProvider` allows: nothing is merged into it. */
    theme: ITheme;
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
    const { theme, children } = props;
    //inherited where none is given: a theme set in here says nothing about what the application looks like
    const surfaceTheme = props.surfaceTheme ?? useContext(SurfaceThemeContext);

    //both contexts, because a v8 component reads its theme from whichever it was written against:
    //`useTheme` takes `ThemeContext`, and everything built with `styled()` takes `CustomizerContext`
    return <FluentThemeContext.Provider value={theme}>
        <CustomizerContext.Provider value={getThemeCustomizations(theme)}>
            <SurfaceThemeContext.Provider value={surfaceTheme}>{children}</SurfaceThemeContext.Provider>
        </CustomizerContext.Provider>
    </FluentThemeContext.Provider>;
};
