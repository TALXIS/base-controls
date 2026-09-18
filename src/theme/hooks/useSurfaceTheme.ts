import { useContext } from "react";
import { useTheme } from "@fluentui/react";
import { ITheme } from "../Theming";
import { SurfaceThemeContext } from "../context";

/**
 * The theme a callout, menu, tooltip or panel is drawn in.
 *
 * A surface is drawn over the application rather than where it was opened from, so a control in a cell of
 * colours of its own still opens one in the application's. With none declared, it is what is around it.
 */
export const useSurfaceTheme = (): ITheme => {
    const surfaceTheme = useContext(SurfaceThemeContext);
    const theme = useTheme();
    return surfaceTheme ?? theme;
};
