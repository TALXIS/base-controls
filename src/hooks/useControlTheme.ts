import { ITheme } from "../interfaces/theme";
import { getControlTheme } from "../utils/Theme";

export const useControlTheme = (fluentDesignLanguage?: ComponentFramework.FluentDesignState): ITheme => {
    return getControlTheme(fluentDesignLanguage);
};