import { createBrandVariants, createV9Theme } from "@fluentui/react-migration-v8-v9";
import { ThemeDesigner } from "@talxis/react-components/dist/utilities/ThemeDesigner";
import { useMemo } from "react";
import { getControlTheme } from "../../utils";
import React from "react";
import { IOptionSet } from "./interfaces";
import Color from "color";
import { ITheme } from "@fluentui/react";

export const useComboBoxTheme = (props: IOptionSet, theme: ITheme): [boolean, ITheme] => {
    const boundValue = props.parameters.value;
    const { Options } = boundValue.attributes;

    const isColorFeatureEnabled = () => {
        if(props.parameters.EnableOptionSetColors?.raw && Options.find(x => x.Color)) {
            return true;
        }
        return false;
    }
    const getOverridenFluentDesingLanguge = () => {
        const isColorEnabled = isColorFeatureEnabled();
        if(!isColorEnabled) {
            return props.context.fluentDesignLanguage;
        }
        const color = boundValue.attributes.Options.find(x => x.Value === boundValue.raw)?.Color;
        if(!color) {
            return props.context.fluentDesignLanguage;
        }

        const inputBackground = color;
        const textColor = Color(color).luminosity() > 0.5 ? '#000000' : '#ffffff';
        const primaryColor = textColor == '#000000' ? Color(inputBackground).darken(0.5).hex() : Color(inputBackground).lighten(0.5).hex();
        
        const customV8Theme = ThemeDesigner.generateTheme({
            primaryColor: primaryColor,
            backgroundColor: theme.semanticColors.bodyBackground,
            textColor: textColor
        });

        const customTokenTheme = createV9Theme(customV8Theme);
        return {
            brand: createBrandVariants(customV8Theme.palette),
            tokenTheme: { ...customTokenTheme, inputBackground: inputBackground, inputText: textColor }
        }
    }
    const overridenFluentDesignLanguage = React.useMemo(() => getOverridenFluentDesingLanguge(), [boundValue.raw]);
    const overridenTheme = useMemo(() => getControlTheme(overridenFluentDesignLanguage), [overridenFluentDesignLanguage])
    return [isColorFeatureEnabled(), overridenTheme];
}