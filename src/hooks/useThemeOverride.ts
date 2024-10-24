import { createBrandVariants, createV9Theme } from "@fluentui/react-migration-v8-v9";
import { ThemeDesigner } from "@talxis/react-components/dist/utilities/ThemeDesigner";
import React from "react";
import { useControlTheme } from "./useControlTheme";

export const useThemeOverride = (primaryColor: string, backgroundColor: string, textColor: string) => {
    const overridenFluentDesignLanguage = React.useMemo(() => {
        const customV8Theme = ThemeDesigner.generateTheme({
            primaryColor: primaryColor,
            backgroundColor: backgroundColor,
            textColor: textColor
        });
        const customTokenTheme = createV9Theme(customV8Theme);
        return {
            brand: createBrandVariants(customV8Theme.palette),
            tokenTheme: customTokenTheme
        }
    }, []
    );
    return useControlTheme(overridenFluentDesignLanguage);
}