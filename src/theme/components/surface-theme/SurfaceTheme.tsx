import React from 'react';
import { ITheme } from "../../Theming";
import { SurfaceThemeContext } from "../../context";

export interface ISurfaceThemeProps {
    /** What a callout, menu, tooltip or panel opened in here is drawn in. */
    theme: ITheme;
    children?: React.ReactNode;
}

/**
 * What everything opened over the application from in here is drawn in.
 *
 * The surfaces take this on their own, so this is only for saying that a part of the tree opens its
 * surfaces in something other than what the application declared.
 */
export const SurfaceTheme = (props: ISurfaceThemeProps) => {
    return <SurfaceThemeContext.Provider value={props.theme}>{props.children}</SurfaceThemeContext.Provider>;
};
