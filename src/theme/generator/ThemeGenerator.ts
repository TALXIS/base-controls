import { BaseSlots, createTheme, getColorFromString, IChoiceGroupOptionStyles, isDark, IThemeRules, ThemeGenerator as FluentThemeGenerator, themeRulesStandardCreator } from "@fluentui/react";
import { MemoryCache } from '@talxis/client-libraries/dist/helpers/cache/MemoryCache';
import { isLightColor } from "../colors";
import { ITheme, IThemeColors } from "../interfaces";

//cloning disabled on purpose: MemoryCache deep-clones on every *hit*, and a generated v8 theme is a large
//object (palette, ~130 semantic colors, fonts, effects, the components tree). A grid cell asks for one
//about six times while it mounts, so the clone was the single most expensive thing on that path. Nothing
//mutates a theme it was handed - the normalisation runs on a fresh object inside the getter, and an edit
//runs on the copy `ThemeBuilder` makes
const ThemeCache = new MemoryCache<ITheme>(true);

/** Where a theme comes from: three colours, and what this package makes of what Fluent designs from them. */
export class ThemeGenerator {

    /** The theme these colours generate, cached on them. */
    public static generate(colors: IThemeColors): ITheme {
        const id = `${colors.primary}_${colors.background}_${colors.text}`;
        return ThemeCache.get(id, () => {
            const theme = ThemeGenerator._design(colors);
            theme.id = id;
            return ThemeGenerator._normalize(theme);
        })!;
    }

    /** What Fluent's own theme designer makes of three colours. */
    private static _design(colors: IThemeColors): ITheme {
        const themeRules = themeRulesStandardCreator();
        const slots = {
            primaryColor: getColorFromString(colors.primary)!,
            textColor: getColorFromString(colors.text)!,
            backgroundColor: getColorFromString(colors.background)!,
        };
        const isCustomization = false;
        const overwriteCustomColor = true;

        FluentThemeGenerator.setSlot(
            themeRules[BaseSlots[BaseSlots.backgroundColor]],
            slots.backgroundColor,
            undefined,
            isCustomization,
            overwriteCustomColor,
        );
        const currentIsDark = isDark(themeRules[BaseSlots[BaseSlots.backgroundColor]].color!);

        FluentThemeGenerator.setSlot(
            themeRules[BaseSlots[BaseSlots.primaryColor]],
            slots.primaryColor,
            currentIsDark,
            isCustomization,
            overwriteCustomColor,
        );
        FluentThemeGenerator.setSlot(
            themeRules[BaseSlots[BaseSlots.foregroundColor]],
            slots.textColor,
            currentIsDark,
            isCustomization,
            overwriteCustomColor,
        );

        //the shade slots are what the designer works in, not what a theme holds
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

        return createTheme({ palette: FluentThemeGenerator.getThemeAsJson(abridgedTheme), isInverted: currentIsDark }) as ITheme;
    }

    /** Takes out what the theme designer does that this package does not want, in place. */
    private static _normalize(theme: ITheme): ITheme {
        //an input sits on a surface of its own rather than on the one the theme was generated for
        const inputTheme = ThemeGenerator._design({
            background: isLightColor(theme.semanticColors.bodyBackground) ? theme.palette.neutralLighter : theme.palette.neutralLight,
            primary: theme.palette.themePrimary,
            text: theme.semanticColors.inputText,
        });
        Object.keys(theme.semanticColors).map(key => {
            if (key.includes('input')) {
                //@ts-ignore
                theme.semanticColors[key] = inputTheme.semanticColors[key];
            }
        });
        theme.semanticColors.inputBorder = 'transparent';
        theme.semanticColors.inputBorderHovered = inputTheme.semanticColors.menuDivider;
        theme.semanticColors.inputTextHovered = inputTheme.semanticColors.inputText;
        theme.semanticColors.inputPlaceholderText = inputTheme.semanticColors.inputText;
        theme.effects.underlined = true;
        theme.components = ThemeGenerator._getComponentStyles(theme);
        return theme;
    }

    /** What a control of this theme looks like where Fluent's own default is not what it wants. */
    private static _getComponentStyles(theme: ITheme) {
        return {
            Toggle: {
                styles: {
                    root: {
                        ':not(&.is-checked) .ms-Toggle-background:hover': {
                            borderColor: theme.semanticColors.smallInputBorder
                        }
                    }
                }
            },
            Checkbox: {
                styles: {
                    root: {
                        ':not(&.is-checked) .ms-Checkbox-checkbox': {
                            borderColor: theme.semanticColors.smallInputBorder
                        }
                    }
                }
            },
            Label: {
                styles: {
                    root: {
                        fontWeight: 'normal'
                    }
                }
            },
            ChoiceGroupOption: {
                styles: {
                    field: {
                        ':not(.is-checked)::before': {
                            borderColor: theme.semanticColors.smallInputBorder
                        }
                    }
                } as IChoiceGroupOptionStyles
            }
        };
    }
}
