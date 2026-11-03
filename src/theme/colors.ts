import { getColorFromRGBA, getColorFromString, getContrastRatio, hsl2rgb, IColor } from '@fluentui/react';
import { MemoryCache } from '@talxis/client-libraries/dist/helpers/cache/MemoryCache';

const IsLightColorCache = new MemoryCache<boolean>();
const ContrastColorCache = new MemoryCache<string>();
const MixedColorCache = new MemoryCache<string>();

const BLACK = '#000000';
const WHITE = '#ffffff';
//WCAG AAA: AA's 4.5:1 reads washed out, such as mid grey on white
const TEXT_CONTRAST = 7;
const LIGHTNESS_STEP = 2;

const parse = (color: string): IColor => getColorFromString(color)!;

const getContrast = (a: string, b: string): number => getContrastRatio(parse(a), parse(b));

const toHex = (red: number, green: number, blue: number): string => `#${getColorFromRGBA({ r: Math.round(red), g: Math.round(green), b: Math.round(blue), a: 100 }).hex}`;

//Fluent converts HSL to RGB but not back
const getHsl = (color: IColor) => {
    const [red, green, blue] = [color.r / 255, color.g / 255, color.b / 255];
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const lightness = (max + min) / 2;
    const delta = max - min;
    if (delta === 0) {
        return { hue: 0, saturation: 0, lightness: lightness * 100 };
    }
    const saturation = delta / (1 - Math.abs(2 * lightness - 1));
    const hue = max === red ? ((green - blue) / delta) % 6 : max === green ? (blue - red) / delta + 2 : (red - green) / delta + 4;
    return { hue: (hue * 60 + 360) % 360, saturation: saturation * 100, lightness: lightness * 100 };
};

/** Whether text drawn on this colour has to be dark to be read. */
export const isLightColor = (color: string): boolean => {
    return IsLightColorCache.get(color, () => getContrast(color, BLACK) >= getContrast(color, WHITE))!;
};

/** Text for the background: its own hue at a contrast of 7:1, or black or white where the hue cannot reach it. */
export const getTextColorForBackground = (backgroundColor: string): string => {
    return ContrastColorCache.get(backgroundColor, () => {
        const isLight = isLightColor(backgroundColor);
        const { hue, saturation, lightness } = getHsl(parse(backgroundColor));
        const step = isLight ? -LIGHTNESS_STEP : LIGHTNESS_STEP;
        for (let candidateLightness = lightness + step; candidateLightness >= 0 && candidateLightness <= 100; candidateLightness += step) {
            const { r, g, b } = hsl2rgb(hue, saturation, candidateLightness);
            const candidate = toHex(r, g, b);
            if (getContrast(candidate, backgroundColor) >= TEXT_CONTRAST) {
                return candidate;
            }
        }
        return isLight ? BLACK : WHITE;
    })!;
};

/**
 * A colour mixed into another, such as a tint of a hue over the background it sits on.
 *
 * @param color The colour mixed in.
 * @param base The colour it is mixed into.
 * @param weight How much of `color` the result holds, from 0 to 1.
 */
export const mixColors = (color: string, base: string, weight: number): string => {
    return MixedColorCache.get(`${color}|${base}|${weight}`, () => {
        const from = parse(base);
        const to = parse(color);
        const channel = (start: number, end: number) => start + (end - start) * weight;
        return toHex(channel(from.r, to.r), channel(from.g, to.g), channel(from.b, to.b));
    })!;
};
