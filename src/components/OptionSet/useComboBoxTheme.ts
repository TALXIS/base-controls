import { IOptionSet } from "./interfaces";
import { ITheme } from "@fluentui/react";
import { Theming, useThemeGenerator } from "@talxis/react-components";
import Color from "color";

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
        if(!colorFeatureEnabled || !selectedOptionColor) {
            colors.backgroundColor = theme.semanticColors.bodyBackground;
            colors.textColor = theme.semanticColors.bodyText;
            colors.primaryColor = theme.palette.themePrimary;
        }
        else {
            colors.backgroundColor = selectedOptionColor;
            colors.textColor = Theming.GetTextColorForBackground(selectedOptionColor);
            if(Theming.IsDarkColor(colors.textColor)) {
                colors.primaryColor = Color(colors.backgroundColor).darken(0.5).hex()
            }
            else {
                colors.primaryColor = Color(colors.backgroundColor).lighten(0.5).hex()
            }
        }
        return colors;
    }
    const getIsColorFeatureEnabled = () => {
        if (props.parameters.EnableOptionSetColors?.raw && Options.find(x => x.Color)) {
            return true;
        }
        return false;
    }

    /**
     * Since we are creating new theme for combobox, we need to add the overrides in cases where there is no color feature enabled or no color is selected.
     */
    const getThemeOverride = (colorFeatureEnabled: boolean) => {
        if(!colorFeatureEnabled || !selectedOptionColor) {
            return props.context.fluentDesignLanguage?.tokenTheme?.fluentV8Overrides;
        }
        return undefined;
    }

    const isColorFeatureEnabled = getIsColorFeatureEnabled();
    const colors = getColors(isColorFeatureEnabled);
    const override = getThemeOverride(isColorFeatureEnabled);

    const currentTheme = useThemeGenerator(colors.primaryColor, colors.backgroundColor, colors.textColor, override)
    return [isColorFeatureEnabled, currentTheme];
}