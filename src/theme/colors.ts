import { getColorFromRGBA, getColorFromString, getContrastRatio, hsl2rgb, IColor } from '@fluentui/react';
import { IThemeColors } from './interfaces';

const BLACK = '#000000';
const WHITE = '#ffffff';
//WCAG AAA: AA's 4.5:1 reads washed out, such as mid grey on white
const TEXT_CONTRAST = 7;
const LIGHTNESS_STEP = 2;
//WCAG AA, the least a tint's own text may reach
const TINT_TEXT_CONTRAST = 4.5;

//how much of the hue each part of a tint holds; a dark surface needs more of it to show
const TINT_WEIGHTS = {
    subtle: {
        light: { background: 0.12, border: 0.28, text: 0.7 },
        dark: { background: 0.18, border: 0.34, text: 0.4 },
    },
    strong: {
        light: { background: 0.4, border: 0.6 },
        dark: { background: 0.45, border: 0.6 },
    },
};

//finding a text colour takes dozens of contrast checks, and a grid asks once per cell
const textColors = new Map<string, string>();
//Fluent reads a named colour by adding an element to the page and asking for its computed style
const parsedColors = new Map<string, IColor>();

const parse = (color: string): IColor => {
    let parsed = parsedColors.get(color);
    if (!parsed) {
        parsed = getColorFromString(color);
        if (!parsed) {
            throw new Error(`'${color}' is not a colour. Pass a hex, rgb(), hsl() or named colour, not a CSS variable.`);
        }
        parsedColors.set(color, parsed);
    }
    return parsed;
};

const toHex = (red: number, green: number, blue: number): string => `#${getColorFromRGBA({ r: Math.round(red), g: Math.round(green), b: Math.round(blue), a: 100 }).hex}`;

//Fluent converts HSL to RGB but not back
const toHsl = (color: IColor) => {
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

/**
 * The WCAG contrast ratio between two colours.
 *
 * @returns From 1, the same colour, to 21, black on white; text needs 4.5 to pass AA and 7 to pass AAA.
 */
export const getColorContrast = (color: string, otherColor: string): number => getContrastRatio(parse(color), parse(otherColor));

/** Whether text on this colour reads better in black than in white. */
export const isLightColor = (color: string): boolean => getColorContrast(color, BLACK) >= getColorContrast(color, WHITE);

/**
 * Mixes one colour into another, channel by channel.
 *
 * @param color The colour mixed in, such as a status hue.
 * @param base The colour it is mixed into, such as the theme's background.
 * @param weight How much of `color` the result holds, from 0 for `base` alone to 1 for `color` alone.
 * @returns The mix, as a hex colour.
 */
export const mixColors = (color: string, base: string, weight: number): string => {
    const from = parse(base);
    const to = parse(color);
    const amount = Math.min(Math.max(weight, 0), 1);
    const channel = (start: number, end: number) => start + (end - start) * amount;
    return toHex(channel(from.r, to.r), channel(from.g, to.g), channel(from.b, to.b));
};

/**
 * A text colour that reads on the background: a shade of its own hue at a contrast of 7:1.
 *
 * @returns The shade nearest to the background that reaches 7:1, or black or white where none of its hue does.
 */
export const getTextColorForBackground = (backgroundColor: string): string => {
    let textColor = textColors.get(backgroundColor);
    if (textColor === undefined) {
        textColor = findTextColor(backgroundColor);
        textColors.set(backgroundColor, textColor);
    }
    return textColor;
};

//steps the background's own lightness away from it, so the text keeps its hue
const findTextColor = (backgroundColor: string): string => {
    const isLight = isLightColor(backgroundColor);
    const { hue, saturation, lightness } = toHsl(parse(backgroundColor));
    const step = isLight ? -LIGHTNESS_STEP : LIGHTNESS_STEP;
    for (let candidateLightness = lightness + step; candidateLightness >= 0 && candidateLightness <= 100; candidateLightness += step) {
        const { r, g, b } = hsl2rgb(hue, saturation, candidateLightness);
        const candidate = toHex(r, g, b);
        if (getColorContrast(candidate, backgroundColor) >= TEXT_CONTRAST) {
            return candidate;
        }
    }
    return isLight ? BLACK : WHITE;
};

/** How much a tint stands out: a wash behind the theme's text, or a fill with text of its own. */
export type ITintStrength = 'subtle' | 'strong';

/** What a surface tinted by a hue is drawn in. */
export interface ITintColors {
    background: string;
    border: string;
    text: string;
}

/**
 * A hue as a surface that sits right in the theme it lands in, light or dark.
 *
 * @param hue The colour meant, such as a status red; its weights are worked out from the surface.
 * @param surface The theme's colours the tint is drawn over.
 */
export const getTintColors = (hue: string, surface: Pick<IThemeColors, 'background' | 'text'>, strength: ITintStrength = 'subtle'): ITintColors => {
    const scheme = isLightColor(surface.background) ? 'light' : 'dark';
    if (strength === 'strong') {
        const weights = TINT_WEIGHTS.strong[scheme];
        const background = mixColors(hue, surface.background, weights.background);
        return { background, border: mixColors(hue, surface.background, weights.border), text: getTextColorForBackground(background) };
    }
    const weights = TINT_WEIGHTS.subtle[scheme];
    const background = mixColors(hue, surface.background, weights.background);
    const text = mixColors(hue, surface.text, weights.text);
    return {
        background,
        border: mixColors(hue, surface.background, weights.border),
        text: getColorContrast(text, background) >= TINT_TEXT_CONTRAST ? text : getTextColorForBackground(background),
    };
};
