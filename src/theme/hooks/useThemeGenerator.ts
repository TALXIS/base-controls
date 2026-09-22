import { useMemo } from "react";
import { ThemeGenerator } from "../generator";
import { IThemeColors } from "../interfaces";

/** The theme these colours generate, for as long as they are the colours. */
export const useThemeGenerator = (colors: IThemeColors) => {
    return useMemo(() => ThemeGenerator.generate(colors), [colors.primary, colors.background, colors.text]);
};
