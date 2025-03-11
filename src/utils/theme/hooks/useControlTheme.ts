import { useMemo } from "react";
import { ControlTheme, IFluentDesignState } from "../ControlTheme";
import { ITheme } from "@talxis/react-components";

export const useControlTheme = (fluentDesignLanguage?: IFluentDesignState): ITheme => {
    const primaryColor = fluentDesignLanguage?.tokenTheme.colorCompoundBrandForeground1;
    const backgroundColor = fluentDesignLanguage?.tokenTheme.colorNeutralBackground1;
    const textColor = fluentDesignLanguage?.tokenTheme.colorNeutralForeground1;

    return useMemo(() => ControlTheme.GetV8ThemeFromFluentDesignLanguage(fluentDesignLanguage), [primaryColor, backgroundColor, textColor]);
};
