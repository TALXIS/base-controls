import { useMemo } from "react";
import { ITheme, IThemeColors } from "../interfaces";
import { colorsOf, IThemeEdit, ThemeBuilder } from "../theme-builder";

export type IUseThemeBuilderParameters = ({ theme: ITheme } | { colors: IThemeColors }) & Partial<IThemeEdit>;

/**
 * The theme a {@link ThemeBuilder} builds, kept for as long as the colours and the edit's key are.
 *
 * @param parameters What the theme is built from: `theme` to start from a built one, whose colours are the
 * seed and which comes back as it is where nothing changed it, or `colors` to generate one from the three;
 * `key` and `edit` ask for one edit over the result, and are taken only together. The edit is handed the
 * built theme to write to, and is remembered by its key rather than by itself - so the key has to name
 * everything the edit reads, or the first theme it produced is what every later caller is given.
 * @returns The built theme, which is the same object across renders while nothing it is keyed on changes.
 */
export const useThemeBuilder = (parameters: IUseThemeBuilderParameters): ITheme => {
    const { key, edit } = parameters;
    const base = 'theme' in parameters ? parameters.theme : undefined;
    const colors = base ? colorsOf(base) : (parameters as { colors: IThemeColors }).colors;

    return useMemo(() => {
        const builder = base ? ThemeBuilder.from({ theme: base }) : ThemeBuilder.fromColors({ colors: colors });
        if (key && edit) {
            builder.edit(key, edit);
        }
        return builder.getTheme();
    }, [base, colors.primary, colors.background, colors.text, key]);
};
