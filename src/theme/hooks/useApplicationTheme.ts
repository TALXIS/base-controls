import { useContext } from "react";
import { useTheme } from "@fluentui/react";
import { ITheme } from "../interfaces";
import { ApplicationThemeContext } from "../ThemeContext";

/** The theme dialogs, menus and other surfaces are drawn in: the application's, or the one around. */
export const useApplicationTheme = (): ITheme => {
    const applicationTheme = useContext(ApplicationThemeContext);
    const theme = useTheme();
    return applicationTheme ?? theme;
};
