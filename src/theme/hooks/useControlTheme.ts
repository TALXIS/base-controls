import { useMemo } from "react";
import { ControlTheme, IFluentDesignState } from "../ControlTheme";
import { ITheme } from "@legacy";
import { getTheme, useTheme } from "@fluentui/react";

export const useControlTheme = (fluentDesignLanguage?: IFluentDesignState): ITheme => {
    const currentTheme = useTheme();
    const baseTheme = getTheme();

    const id = fluentDesignLanguage?.v8FluentOverrides?.id;
    const primaryColor = fluentDesignLanguage?.tokenTheme.colorCompoundBrandForeground1;
    const backgroundColor = fluentDesignLanguage?.tokenTheme.colorNeutralBackground1;
    const textColor = fluentDesignLanguage?.tokenTheme.colorNeutralForeground1;

return useMemo(() => {
    //a theme set above is what a control with no design language of its own is drawn in
    if (!fluentDesignLanguage && currentTheme !== baseTheme) {
        return currentTheme;
    }
    return ControlTheme.GetV8ThemeFromFluentDesignLanguage(fluentDesignLanguage);
}, [primaryColor, backgroundColor, textColor, id, currentTheme]);
};
