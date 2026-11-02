import { useMemo } from "react";
import { ITheme } from "../interfaces";
import { createThemeBuilder, IThemeBuilderSource, IThemeEdit } from "../theme-builder";

/**
 * The theme a theme builder builds, kept while the colours and the edit's key stay the same.
 *
 * @param source What to start from.
 * @param edit One edit over the result, remembered by its key, so the key has to name everything it reads.
 * @returns The same object across renders while nothing it is keyed on changes.
 */
export const useThemeBuilder = (source: IThemeBuilderSource, edit?: IThemeEdit): ITheme => {
    const builder = createThemeBuilder(source);
    const { primary, background, text } = builder.colors;

    return useMemo(() => {
        if (edit) {
            builder.edit(edit.key, edit.edit);
        }
        return builder.getTheme();
    }, ['theme' in source ? source.theme : undefined, primary, background, text, edit?.key]);
};
