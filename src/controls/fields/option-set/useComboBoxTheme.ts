import { IOptionSet } from "./interfaces";
import { FontWeights, ITheme } from "@fluentui/react";
import { getTintColors, useThemeBuilder } from "@theme";

export const useComboBoxTheme = (props: IOptionSet, theme: ITheme): [boolean, ITheme] => {
    const boundValue = props.parameters.value;
    const { Options } = boundValue.attributes;
    const selectedOptionColor = boundValue.attributes.Options.find(x => x.Value === boundValue.raw)?.Color;

    const getIsColorFeatureEnabled = () => {
        if (props.parameters.EnableOptionSetColors?.raw && Options.find(x => x.Color)) {
            return true;
        }
        return false;
    }

    const isColorFeatureEnabled = getIsColorFeatureEnabled();
    const tag = isColorFeatureEnabled && selectedOptionColor
        ? getTintColors(selectedOptionColor, { background: theme.semanticColors.bodyBackground, text: theme.semanticColors.bodyText })
        : undefined;

    //a tag edits the surrounding theme
    const currentTheme = useThemeBuilder({ theme }, tag ? {
        key: `optionSet|${tag.background}|${tag.text}|${tag.border}`,
        edit: result => {
            result.semanticColors.inputBackground = tag.background;
            result.semanticColors.inputText = tag.text;
            result.semanticColors.inputTextHovered = tag.text;
            result.fonts.medium.fontWeight = FontWeights.semibold;
        },
    } : undefined);
    return [isColorFeatureEnabled, currentTheme];
}
