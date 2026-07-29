import { BaseSlots, createTheme, getColorFromString, ICheckboxStyleProps, isDark, IThemeRules, IToggleStyleProps, ThemeGenerator, themeRulesStandardCreator, ITheme as IBaseTheme, IEffects, IButtonStyles, IComboBoxOptionStyles, ICalloutContentStyleProps, ICalloutContentStyles, ContextualMenuItem, IContextualMenuItemProps, IContextualMenuItemStyleProps, IContextualMenuItemStyles, ContextualMenuBase, ContextualMenuItemBase, IContextualMenuStyleProps, IContextualMenuStyles, IContextualMenuItem, IChoiceGroupOptionStyleProps, IChoiceGroupOptionStyles, ICheckStyleProps, ICheckboxStyles, IComboBoxStyles, ComponentsStyles, ChoiceGroupOption, mergeThemes } from "@fluentui/react";
import Color from 'color';
import { DeepPartial } from "../../interfaces/components";
import { MemoryCache } from '@talxis/client-libraries/dist/helpers/cache/MemoryCache';

const ThemeCache = new MemoryCache<ITheme>();
const IsLightColorCache = new MemoryCache<boolean>();
const IsDarkColorCache = new MemoryCache<boolean>();
const ContrastColorCache = new MemoryCache<string>();

export interface ITheme extends IBaseTheme {
    effects: IEffects & {
        underlined?: boolean
    }
}
export class Theming {
    /**
     * Returns a color that is contrasting to the provided background color so it can be used as a text color.
     *
     */
    public static GetTextColorForBackground(backgroundColor: string): string {
        if (Theming.IsLightColor(backgroundColor)) {
            return ContrastColorCache.get(backgroundColor, () => {
                return new Color(backgroundColor).darken(0.75).hex();
            })!;
        }
        return darkTheme.semanticColors.bodyText;
    }

    /**
     *
     * @public
     * @static
     * @param {string} primaryColor
     * @param {string} backgroundColor
     * @param {string} textColor
     * @param {?DeepPartial<ITheme>} [themeOverride] - Allows you to override any theme property. Resulting theme will be a merge of the generated theme and provided override.
     * @returns {ITheme}
     */
    public static GenerateThemeV8(primaryColor: string, backgroundColor: string, textColor: string, themeOverride?: DeepPartial<ITheme>): ITheme {
        const key = `${primaryColor}_${backgroundColor}_${textColor}`;
        let theme = ThemeCache.get(key, () => {
            const v8Theme = ThemeDesigner.generateTheme({
                backgroundColor: backgroundColor,
                primaryColor: primaryColor,
                textColor: textColor
            });
            v8Theme.id = key;
            return Theming._NormalizeTheme(v8Theme);
        })!;
        if (themeOverride) {
            theme = mergeThemes(theme, themeOverride) as ITheme;
        }
        return theme;
    }

    public static IsLightColor(color: string) {
        return IsLightColorCache.get(color, () => new Color(color).isLight());
    }
    public static IsDarkColor(color: string) {
        return IsDarkColorCache.get(color, () => new Color(color).isDark());
    }

    /**
     * Purpose of this method is to remove some of the unwanted stuff the theme generator does
     */
    private static _NormalizeTheme(v8Theme: ITheme): ITheme {
        //defaults for input backgrounds
        const inputTheme = ThemeDesigner.generateTheme({
            backgroundColor: Theming.IsLightColor(v8Theme.semanticColors.bodyBackground) ? v8Theme.palette.neutralLighter : v8Theme.palette.neutralLight,
            primaryColor: v8Theme.palette.themePrimary,
            textColor: v8Theme.semanticColors.inputText
        });
        Object.entries(v8Theme.semanticColors).map(([key, value]) => {
            if (key.includes('input')) {
                //@ts-ignore
                v8Theme.semanticColors[key] = inputTheme.semanticColors[key]
            }
        })
        v8Theme.semanticColors.inputBorder = 'transparent';
        v8Theme.semanticColors.inputBorderHovered = inputTheme.semanticColors.menuDivider;
        v8Theme.semanticColors.inputTextHovered = inputTheme.semanticColors.inputText;
        v8Theme.semanticColors.inputPlaceholderText = inputTheme.semanticColors.inputText;
        v8Theme.effects.underlined = true;
        v8Theme.components = Theming._GetComponents(v8Theme);
        return v8Theme;
    }

    /**
    * Resolves an issue where not all colors from a nested theme are applied to callout components.
    * 
    * The issue seems to stem from Microsoft's logic for merging styles, particularly because 
    * callouts are rendered at the top level of the DOM. Despite being correctly set up in the theme, 
    * the colors are not passed to the final CSS class. 
    * 
    * Attempts to directly set the CSS property are overridden. To work around this, the 
    * `-webkit-text-fill-color` property is used instead of the original styles property.
    * 
    */
    private static _GetComponents(v8Theme: ITheme) {
        return {
            ActionButton: {
                styles: {
                    root: {
                        '&&.ms-ComboBox-option:hover': {
                            background: `${v8Theme.semanticColors.buttonBackgroundHovered} !important`
                        },
                        '.ms-ComboBox-optionText': {
                            color: v8Theme.semanticColors.buttonText
                        },
                        '&.ms-ComboBox-option::after': {
                            borderColor: `${v8Theme.palette.black} !important`
                        }
                    }
                }
            },
            Toggle: {
                styles: {
                    root: {
                        ':not(&.is-checked) .ms-Toggle-background:hover': {
                            borderColor: v8Theme.semanticColors.smallInputBorder
                        }
                    }
                }
            },
            Checkbox: {
                styles: {
                    root: {
                        ':not(&.is-checked) .ms-Checkbox-checkbox': {
                            borderColor: v8Theme.semanticColors.smallInputBorder
                        }
                    }
                }
            },
            ChoiceGroupOption: {
                styles: {
                    field: {
                        ':not(.is-checked)::before': {
                            borderColor: v8Theme.semanticColors.smallInputBorder
                        }
                    }
                } as IChoiceGroupOptionStyles
            }
        }
    }

    /**
     * Allows specifying a different theme for the contextual menu than its parent. Useful for callouts
     */
    public static GetThemedContextualItems(items: IContextualMenuItem[], theme: ITheme): IContextualMenuItem[] {
        return items.map(item => {
            const newItem = { ...item };
            if (newItem.subMenuProps) {
                newItem.subMenuProps = {
                    ...newItem.subMenuProps,
                    theme: theme,
                    calloutProps: {
                        ...newItem.subMenuProps.calloutProps,
                        theme: theme
                    },
                    items: this.GetThemedContextualItems(newItem.subMenuProps.items, theme)
                };
            }
            return newItem;
        });
    }
}
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

const lightTheme = Theming.GenerateThemeV8('#0078d4', '#ffffff', '#323130');
const darkTheme = Theming.GenerateThemeV8('#0078d4', '#1c1b1b', '#ffffff');