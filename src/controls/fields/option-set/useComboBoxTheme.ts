import { IOptionSet } from "./interfaces";
import { ITheme, Theme } from "@fluentui/react";
import { DeepPartial } from "@talxis/client-libraries";
import { Theming, useThemeGenerator } from "@theme";

export const useComboBoxTheme = (props: IOptionSet, theme: ITheme): [boolean, ITheme] => {
    const boundValue = props.parameters.value;
    const { Options } = boundValue.attributes;
    const selectedOptionColor = boundValue.attributes.Options.find(x => x.Value === boundValue.raw)?.Color;

    const getColors = (colorFeatureEnabled: boolean) => {
        const colors = {
            backgroundColor: theme.semanticColors.bodyBackground,
            textColor: theme.semanticColors.bodyText,
            primaryColor: theme.palette.themePrimary
        }
        if (!colorFeatureEnabled) {
            return colors;
        }
        if (!selectedOptionColor) {
            colors.backgroundColor = theme.semanticColors.inputBackground;
            return colors;
        }
        colors.backgroundColor = selectedOptionColor;
        colors.textColor = Theming.GetTextColorForBackground(selectedOptionColor);
        return colors;
    }
    const getIsColorFeatureEnabled = () => {
        if (props.parameters.EnableOptionSetColors?.raw && Options.find(x => x.Color)) {
            return true;
        }
        return false;
    }

    /** An option drawn in a colour of its own reads as a tag rather than as text. */
    const getThemeOverride = (colorFeatureEnabled: boolean): DeepPartial<Theme> => {
        if (!colorFeatureEnabled || !selectedOptionColor) {
            return {};
        }
        return {
            fonts: {
                medium: {
                    fontWeight: 600
                }
            }
        };
    }

    const isColorFeatureEnabled = getIsColorFeatureEnabled();
    const colors = getColors(isColorFeatureEnabled);
    const override = getThemeOverride(isColorFeatureEnabled);

    const currentTheme = useThemeGenerator(colors.primaryColor, colors.backgroundColor, colors.textColor, override)
    return [isColorFeatureEnabled, currentTheme];
}