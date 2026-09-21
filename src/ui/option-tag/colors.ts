import Color from 'color';

const colorsCache = new Map<string, IOptionTagColors>();

/** What a tag drawn in an option's colour is made of. */
export interface IOptionTagColors {
    background: string;
    border: string;
    text: string;
}

/**
 * How a tag drawn in an option's colour reads: a tint of it to sit on, an edge, and a label.
 *
 * @param surface What the tag is drawn on.
 * @param text What the theme draws its words in.
 */
export const getOptionTagColors = (color: string, surface: string, text: string): IOptionTagColors => {
    const key = `${color}_${surface}_${text}`;
    let colors = colorsCache.get(key);
    if (!colors) {
        colors = {
            background: mix(surface, color, 0.12),
            border: mix(surface, color, 0.28),
            text: mix(text, color, 0.7),
        };
        colorsCache.set(key, colors);
    }
    return colors;
};

/** @param weight How much of `color` is left in what comes back. */
const mix = (base: string, color: string, weight: number): string => {
    return new Color(base).mix(new Color(color), weight).hex();
};
