import { IOptionSet } from "./interfaces";
import { ITheme } from "@fluentui/react";
import { DeepPartial } from "@talxis/client-libraries";
import { Theming, useThemeGenerator } from "@talxis/react-components";

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
            colors.backgroundColor = theme.palette.neutralLight
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
    const getThemeOverride = (colorFeatureEnabled: boolean) => {
        if (!colorFeatureEnabled || !selectedOptionColor) {
            const override: DeepPartial<ITheme> = {
                ...props.context.fluentDesignLanguage?.v8FluentOverrides,
            }
            if(isColorFeatureEnabled) {
                //if color feature is enabled, ignore overrides here (they can interfere with the coloring)
                override.semanticColors = {};
            }
            if(override.semanticColors?.inputBackground)
            return props.context.fluentDesignLanguage?.v8FluentOverrides;
        }
        return undefined;
    }

    const isColorFeatureEnabled = getIsColorFeatureEnabled();
    const colors = getColors(isColorFeatureEnabled);
    const override = getThemeOverride(isColorFeatureEnabled);

    const currentTheme = useThemeGenerator(colors.primaryColor, colors.backgroundColor, colors.textColor, override)
    return [isColorFeatureEnabled, currentTheme];
}