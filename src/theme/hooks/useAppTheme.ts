import { useContext } from "react";
import { ITheme } from "../interfaces";
import { AppThemeContext } from "../ThemeContext";

/** The theme dialogs, menus and other surfaces are drawn in; throws outside an `AppThemeProvider`. */
export const useAppTheme = (): ITheme => {
    const appTheme = useContext(AppThemeContext);
    if (!appTheme) {
        throw new Error('Base Controls need an AppThemeProvider above them: wrap your application in one.');
    }
    return appTheme;
};
