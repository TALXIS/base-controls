import { useMemo } from "react"
import { ControlTheme, IFluentDesignState } from "../ControlTheme"
import { DeepPartial } from "@talxis/client-libraries"
import { ITheme } from "@fluentui/react"

export const useControlThemeGenerator = (primaryColor: string, backgroundColor: string, textColor: string, options?: {
    /**
    * Optional overrides that will get applied when v8 theme is generated from fluentDesignLanguage
    */
    v8FluentOverrides?: DeepPartial<ITheme>;
    /**
     * The application's theme may differ from the control's theme. This is often the case when rendering a PCF as a cell customizer with conditional formatting.
     * This object allows you to set application theme so PCF's can use it to render surfaces accurately.
     */
    applicationTheme?: ITheme;
}): IFluentDesignState => {
    return useMemo(() => {
        return ControlTheme.GenerateFluentDesignLanguage(primaryColor, backgroundColor, textColor, options)
    }, [primaryColor, backgroundColor, textColor])
}