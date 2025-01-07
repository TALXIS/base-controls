import { MemoryCache } from "@talxis/client-libraries"
import { ITheme, Theming } from "@talxis/react-components";

const ThemeCache = new MemoryCache();
let components: any;
export const useCachedThemeGenerator = (primaryColor: string, backgroundColor: string, textColor: string): ITheme => {
    const key = `${primaryColor}_${backgroundColor}_${textColor}`;
    const theme = ThemeCache.get(key, () => {
        const theme = Theming.GenerateThemeV8(primaryColor, backgroundColor, textColor);
        components = theme.components;
        theme.components = undefined;
        return theme;
    })!;
    theme.components = components;
    return theme;
}