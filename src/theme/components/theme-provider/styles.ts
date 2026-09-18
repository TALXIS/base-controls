import { ITheme, mergeStyleSets } from "@fluentui/react";

export const getThemeProviderStyles = (theme: ITheme) => {
    const { semanticColors, fonts } = theme;
    return mergeStyleSets({
        //what `ThemeProvider` paints its element in
        root: {
            color: semanticColors.bodyText,
            background: semanticColors.bodyBackground,
            fontFamily: fonts.medium.fontFamily,
            fontWeight: fonts.medium.fontWeight,
            fontSize: fonts.medium.fontSize,
            MozOsxFontSmoothing: fonts.medium.MozOsxFontSmoothing,
            WebkitFontSmoothing: fonts.medium.WebkitFontSmoothing,
        },
    });
};
