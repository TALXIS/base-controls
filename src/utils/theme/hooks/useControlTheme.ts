import { useMemo } from "react";
import { BaseSlots, createTheme, getColorFromString, isDark, ITheme, IThemeRules, ThemeGenerator, themeRulesStandardCreator, useTheme } from "@fluentui/react";
import { ControlTheme, IFluentDesignState } from "../ControlTheme";

export const useControlTheme = (fluentDesignLanguage?: IFluentDesignState): ITheme => {
    const primaryColor = fluentDesignLanguage?.tokenTheme.colorCompoundBrandForeground1;
    const backgroundColor = fluentDesignLanguage?.tokenTheme.colorNeutralBackground1;
    const textColor = fluentDesignLanguage?.tokenTheme.colorNeutralForeground1;

    return useMemo(() => ControlTheme.GetV8ThemeFromFluentDesignLanguage(fluentDesignLanguage), [primaryColor, backgroundColor, textColor]);
};




class ThemeDesigner {

    public static generateTheme(
        {
            primaryColor, textColor, backgroundColor,
        }: {
            primaryColor: string, textColor: string, backgroundColor: string,
        },
    ) {
        const themeRules = themeRulesStandardCreator();
        const colors = {
            primaryColor: getColorFromString(primaryColor)!,
            textColor: getColorFromString(textColor)!,
            backgroundColor: getColorFromString(backgroundColor)!,
        };

        const isCustomization = false;
        const overwriteCustomColor = true;

        ThemeGenerator.setSlot(
            themeRules[BaseSlots[BaseSlots.backgroundColor]],
            colors.backgroundColor,
            undefined,
            isCustomization,
            overwriteCustomColor,
        );
        const currentIsDark = isDark(themeRules[BaseSlots[BaseSlots.backgroundColor]].color!);

        ThemeGenerator.setSlot(
            themeRules[BaseSlots[BaseSlots.primaryColor]],
            colors.primaryColor,
            currentIsDark,
            isCustomization,
            overwriteCustomColor,
        );
        ThemeGenerator.setSlot(
            themeRules[BaseSlots[BaseSlots.foregroundColor]],
            colors.textColor,
            currentIsDark,
            isCustomization,
            overwriteCustomColor,
        );

        // strip out the unnecessary shade slots from the final output theme
        const abridgedTheme: IThemeRules = Object.entries(themeRules).reduce(
            (acc, [ruleName, ruleValue]) => (
                (
                    ruleName.indexOf('ColorShade') === -1
                    && ruleName !== 'primaryColor'
                    && ruleName !== 'backgroundColor'
                    && ruleName !== 'foregroundColor'
                    && ruleName.indexOf('body') === -1
                )
                    ? {
                        ...acc,
                        [ruleName]: ruleValue,
                    }
                    : acc
            ),
            {} as IThemeRules,
        );

        return createTheme({ palette: ThemeGenerator.getThemeAsJson(abridgedTheme), isInverted: isDark(themeRules[BaseSlots[BaseSlots.backgroundColor]].color!) });
    }
}