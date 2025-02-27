import { useMemo } from "react";
import { ITheme } from "@fluentui/react";
import { ControlTheme, IFluentDesignState } from "../ControlTheme";

export const useControlTheme = (fluentDesignLanguage?: IFluentDesignState): ITheme => {
    const primaryColor = fluentDesignLanguage?.tokenTheme.colorCompoundBrandForeground1;
    const backgroundColor = fluentDesignLanguage?.tokenTheme.colorNeutralBackground1;
    const textColor = fluentDesignLanguage?.tokenTheme.colorNeutralForeground1;

    return useMemo(() => ControlTheme.GetV8ThemeFromFluentDesignLanguage(fluentDesignLanguage), [primaryColor, backgroundColor, textColor]);
};