import { useMemo } from "react";
import { getControlTheme } from "../utils/theme/getControlTheme";
import { ITheme } from "@fluentui/react";

export const useControlTheme = (fluentDesignLanguage?: ComponentFramework.FluentDesignState): ITheme => {
    const primaryColor = fluentDesignLanguage?.tokenTheme.colorCompoundBrandForeground1;
    const backgroundColor = fluentDesignLanguage?.tokenTheme.colorNeutralBackground1;
    const textColor = fluentDesignLanguage?.tokenTheme.colorNeutralForeground1;

    return useMemo(() => getControlTheme(fluentDesignLanguage), [primaryColor, backgroundColor, textColor]);
};