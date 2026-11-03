import { useContext } from "react";
import { ITheme } from "../interfaces";
import { ApplicationThemeContext } from "../ThemeContext";

/** The theme dialogs, menus and other surfaces are drawn in; throws outside an `ApplicationThemeProvider`. */
export const useApplicationTheme = (): ITheme => {
    const applicationTheme = useContext(ApplicationThemeContext);
    if (!applicationTheme) {
        throw new Error('Base Controls need an ApplicationThemeProvider above them: wrap your application in one.');
    }
    return applicationTheme;
};
