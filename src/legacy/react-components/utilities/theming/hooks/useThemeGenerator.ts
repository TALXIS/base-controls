import { useMemo } from "react"
import { DeepPartial } from "../../../interfaces/components"
import { ITheme, Theming } from "../Theming";

/**
 * Allows you to create a custom V8 theme based on provided colors.
 *
 */
export const useThemeGenerator = (primaryColor: string, backgroundColor: string, textColor: string, themeOverride?: DeepPartial<ITheme>) => {
    return useMemo(() => {
        return Theming.GenerateThemeV8(primaryColor, backgroundColor, textColor, themeOverride)
    }, [primaryColor, backgroundColor, textColor])
}