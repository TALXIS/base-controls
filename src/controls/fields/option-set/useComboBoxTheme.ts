import { IOptionSet } from "./interfaces";
import { FontWeights, ITheme } from "@fluentui/react";
import { IThemeColors, useThemeBuilder } from "@theme";
import { getOptionTagColors } from "@ui";

export const useComboBoxTheme = (props: IOptionSet, theme: ITheme): [boolean, ITheme] => {
    const boundValue = props.parameters.value;
    const { Options } = boundValue.attributes;
    const selectedOptionColor = boundValue.attributes.Options.find(x => x.Value === boundValue.raw)?.Color;

    const getColors = (colorFeatureEnabled: boolean): IThemeColors => {
        const colors = {
            background: theme.semanticColors.bodyBackground,
            text: theme.semanticColors.bodyText,
            primary: theme.palette.themePrimary
        }
        if (!colorFeatureEnabled) {
            return colors;
        }
        if (!selectedOptionColor) {
            colors.background = theme.semanticColors.inputBackground;
            return colors;
        }
        const tag = getOptionTagColors(selectedOptionColor, theme.semanticColors.bodyBackground, theme.semanticColors.bodyText);
        colors.background = tag.background;
        colors.text = tag.text;
        return colors;
    }
    const getIsColorFeatureEnabled = () => {
        if (props.parameters.EnableOptionSetColors?.raw && Options.find(x => x.Color)) {
            return true;
        }
        return false;
    }

    const isColorFeatureEnabled = getIsColorFeatureEnabled();
    const colors = getColors(isColorFeatureEnabled);
    const border = isColorFeatureEnabled && selectedOptionColor ? getOptionTagColors(selectedOptionColor, theme.semanticColors.bodyBackground, theme.semanticColors.bodyText).border : undefined;

    //an option drawn in a colour of its own reads as a tag rather than as text
    const currentTheme = useThemeBuilder({
        colors: colors,
        key: border ? `optionSet|${border}` : undefined,
        edit: border ? result => {
            result.semanticColors.inputBorder = border;
            result.semanticColors.inputBorderHovered = border;
            result.fonts.medium.fontWeight = FontWeights.semibold;
        } : undefined
    });
    return [isColorFeatureEnabled, currentTheme];
}