import { useMemo } from "react";
import { ITintStrength } from "../colors";
import { ITheme } from "../interfaces";
import { createThemeBuilder, IThemeBuilderSource, IThemeEdit } from "../theme-builder";

/** What {@link useThemeBuilder} does to the theme its source builds. */
export interface IUseThemeBuilderOptions {
    /** A hue the background and text are tinted by, as `ThemeBuilder.tint` does. */
    tint?: { hue: string; strength?: ITintStrength };
    /** One edit over the result, remembered by its key, so the key has to name everything it reads. */
    edit?: IThemeEdit;
}

/**
 * The theme a theme builder builds, kept while the colours and the edit's key stay the same.
 *
 * @param source What to start from.
 * @returns The same object across renders while nothing it is keyed on changes.
 */
export const useThemeBuilder = (source: IThemeBuilderSource, options: IUseThemeBuilderOptions = {}): ITheme => {
    const { tint, edit } = options;
    const builder = createThemeBuilder(source);
    const { primary, background, text } = builder.colors;

    return useMemo(() => {
        if (tint) {
            builder.tint(tint.hue, tint.strength);
        }
        if (edit) {
            builder.edit(edit.key, edit.edit);
        }
        return builder.getTheme();
    }, ['theme' in source ? source.theme : undefined, primary, background, text, tint?.hue, tint?.strength, edit?.key]);
};
