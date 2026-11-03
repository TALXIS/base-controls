import { isLightColor, mixColors } from '@theme';

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
    //on a dark surface the label leans toward the text, or a saturated colour glows
    const isDark = !isLightColor(surface);
    return {
        background: mixColors(color, surface, isDark ? 0.18 : 0.12),
        border: mixColors(color, surface, isDark ? 0.34 : 0.28),
        text: mixColors(color, text, isDark ? 0.4 : 0.7),
    };
};
