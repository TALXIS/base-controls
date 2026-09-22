import Color from 'color';
import { MemoryCache } from '@talxis/client-libraries/dist/helpers/cache/MemoryCache';
import { isLightColor } from "./isLightColor";

const ContrastColorCache = new MemoryCache<string>();

//what a generated dark theme resolves its body text to, without generating one to ask
const DARK_TEXT_COLOR = '#ffffff';

/** A colour that reads on this background, for text drawn over it. */
export const getTextColorForBackground = (backgroundColor: string): string => {
    if (!isLightColor(backgroundColor)) {
        return DARK_TEXT_COLOR;
    }
    return ContrastColorCache.get(backgroundColor, () => new Color(backgroundColor).darken(0.75).hex())!;
};
