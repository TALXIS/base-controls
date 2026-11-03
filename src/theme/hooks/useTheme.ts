import { useTheme as useFluentTheme } from "@fluentui/react";
import { ITheme } from "../interfaces";
import { useAppTheme } from "./useAppTheme";

/** The theme a component is drawn in, the nearest `ThemeProvider`'s; throws outside an `AppThemeProvider`. */
export const useTheme = (): ITheme => {
    useAppTheme();
    return useFluentTheme() as ITheme;
};
