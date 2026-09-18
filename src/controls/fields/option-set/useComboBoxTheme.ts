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

    /**
     * Since we are creating new theme for combobox, we need to add the overrides in cases where there is no color feature enabled or no color is selected.
     */
    const getThemeOverride = (colorFeatureEnabled: boolean): DeepPartial<Theme> => {
        const hostOverride = props.context.fluentDesignLanguage?.v8FluentOverrides;
        if (!colorFeatureEnabled || !selectedOptionColor) {
            return { ...hostOverride };
        }
        //the option's colour is the input background here, so the host's is dropped - out of a copy of its
        //overrides rather than out of the object itself, which every other control reads the same instance of
        const { inputBackground, ...semanticColors } = hostOverride?.semanticColors ?? {};
        return {
            fonts: {
                medium: {
                    fontWeight: 600
                }
            },
            ...hostOverride,
            ...(hostOverride?.semanticColors ? { semanticColors: semanticColors } : {}),
        };
    }

    const isColorFeatureEnabled = getIsColorFeatureEnabled();
    const colors = getColors(isColorFeatureEnabled);
    const override = getThemeOverride(isColorFeatureEnabled);

    const currentTheme = useThemeGenerator(colors.primaryColor, colors.backgroundColor, colors.textColor, override)
    return [isColorFeatureEnabled, currentTheme];
}