import { useTheme as useFluentTheme } from "@fluentui/react";
import { ITheme } from "../interfaces";
import { useApplicationTheme } from "./useApplicationTheme";

/** The theme a component is drawn in, the nearest `ThemeProvider`'s; throws outside an `ApplicationThemeProvider`. */
export const useTheme = (): ITheme => {
    useApplicationTheme();
    return useFluentTheme() as ITheme;
};
