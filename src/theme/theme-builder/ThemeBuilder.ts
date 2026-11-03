import { BaseSlots, createTheme, getColorFromString, IChoiceGroupOptionStyles, isDark, IThemeRules, ThemeGenerator as FluentThemeGenerator, themeRulesStandardCreator } from "@fluentui/react";
import { MemoryCache } from '@talxis/client-libraries/dist/helpers/cache/MemoryCache';
import { isLightColor, mixColors } from "../colors";
import { ITheme, IThemeColors } from "../interfaces";

//cloning disabled on purpose: MemoryCache deep-clones on every *hit*, and a generated v8 theme is a large
//object (palette, ~130 semantic colors, fonts, effects, the components tree). A grid cell asks for one
//about six times while it mounts, so the clone was the single most expensive thing on that path. Nothing
//mutates a theme it was handed - the normalisation runs on a fresh object inside the getter, and an edit
//runs on the copy the builder makes
const GeneratedThemeCache = new MemoryCache<ITheme>(true);

//an edited theme is handed out by reference like a generated one, and nothing mutates what it was handed
const EditedThemeCache = new MemoryCache<ITheme>(true);

/** An edit asked for as a builder is made, which is {@link ThemeBuilder.edit} by another name. */
export interface IThemeEdit {
    /** What this edit is, which is the caller's promise that the same key means the same edit. */
    key: string;
    edit: (theme: ITheme) => void;
}

/** A built theme whose colours are the seed, the three colours, or a Fluent v9 theme. */
export type IThemeBuilderSource = { theme: ITheme } | { colors: IThemeColors } | { fluentDesignLanguage: ComponentFramework.FluentDesignState };

const DEFAULT_COLORS: IThemeColors = { primary: '#0078d4', background: '#ffffff', text: '#323130' };

//how much of the text a dark theme's neutral slots hold over the background, after Fluent v9's webDarkTheme
const DARK_NEUTRAL_RAMP = {
    neutralLighterAlt: 0.05, //colorSubtleBackgroundSelected
    neutralLighter: 0.09, //colorNeutralBackground1Hover
    neutralLight: 0.19, //colorNeutralStroke2
    neutralQuaternaryAlt: 0.22,
    neutralQuaternary: 0.24, //colorNeutralForegroundDisabled
    neutralTertiaryAlt: 0.28, //colorNeutralStroke1
    neutralTertiary: 0.52, //colorNeutralForeground4
    neutralSecondaryAlt: 0.57,
    neutralSecondary: 0.62, //colorNeutralForeground3
    neutralPrimaryAlt: 0.81, //colorNeutralForeground2
    neutralPrimary: 1,
    neutralDark: 1,
};

/** What a theme is worked out from: the colours it is generated from, and the edits over the result. */
export class ThemeBuilder {
    private _colors: IThemeColors;
    private _base?: ITheme;
    private _edits: { key: string; edit: (theme: ITheme) => void }[] = [];

    constructor(source?: IThemeBuilderSource) {
        if (!source) {
            this._colors = { ...DEFAULT_COLORS };
        }
        else if ('theme' in source) {
            this._colors = this._colorsOf(source.theme);
            this._base = source.theme;
        }
        else if ('fluentDesignLanguage' in source) {
            const { tokenTheme } = source.fluentDesignLanguage;
            this._colors = { primary: tokenTheme.colorBrandBackground, background: tokenTheme.colorNeutralBackground1, text: tokenTheme.colorNeutralForeground1 };
        }
        else {
            this._colors = { ...source.colors };
        }
    }

    /** The colours the theme is generated from: change one and the palette follows it. */
    public get colors(): IThemeColors {
        return this._colors;
    }

    /**
     * Edits the built theme, after everything has had its say on the colours.
     *
     * @param key What this edit is, which is the caller's promise that the same key means the same edit.
     */
    public edit(key: string, edit: (theme: ITheme) => void): void {
        this._edits.push({ key, edit });
    }

    /** The theme, generated from the colours and with every edit applied in the order it was asked. */
    public getTheme(): ITheme {
        return this._edits.reduce((theme, { key, edit }) => this._extend(theme, key, edit), this._getBaseTheme());
    }

    private _getBaseTheme(): ITheme {
        const { primary, background, text } = this._colors;
        //what it started from, where nothing asked for anything else
        if (this._base && primary === this._base.palette.themePrimary
            && background === this._base.semanticColors.bodyBackground
            && text === this._base.semanticColors.bodyText) {
            return this._base;
        }
        return this._generate(this._colors);
    }

    /** A copy of the theme with the edit applied, cached under the theme's id and the edit's key. */
    private _extend(theme: ITheme, key: string, edit: (theme: ITheme) => void): ITheme {
        //a theme nothing can name cannot be cached against, so the edit runs on every call
        if (!theme.id) {
            return this._editCopy(theme, edit);
        }
        const id = `${theme.id}_${key}`;
        return EditedThemeCache.get(id, () => {
            const edited = this._editCopy(theme, edit);
            edited.id = id;
            return edited;
        })!;
    }

    /** The cache hands its themes out by reference, so an edit is given a copy of one. */
    private _editCopy(theme: ITheme, edit: (theme: ITheme) => void): ITheme {
        const copy = this._clone(theme);
        //an id is the promise that the same id means the same theme, and this is a different one
        copy.id = undefined;
        edit(copy);
        return copy;
    }

    private _colorsOf(theme: ITheme): IThemeColors {
        return { primary: theme.palette.themePrimary, background: theme.semanticColors.bodyBackground, text: theme.semanticColors.bodyText };
    }

    //not `structuredClone`: it throws on a function, and a theme's component styles are allowed to be one
    private _clone<T>(value: T): T {
        if (Array.isArray(value)) {
            return value.map(entry => this._clone(entry)) as T;
        }
        if (!value || typeof value !== 'object' || Object.getPrototypeOf(value) !== Object.prototype) {
            return value;
        }
        return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, this._clone(entry)])) as T;
    }

    /** The theme these colours generate, cached on them. */
    private _generate(colors: IThemeColors): ITheme {
        const id = `${colors.primary}_${colors.background}_${colors.text}`;
        return GeneratedThemeCache.get(id, () => {
            const theme = this._design(colors);
            theme.id = id;
            return this._normalize(theme);
        })!;
    }

    /** What Fluent's own theme designer makes of three colours. */
    private _design(colors: IThemeColors): ITheme {
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

        const palette = FluentThemeGenerator.getThemeAsJson(abridgedTheme);
        //the designer packs a dark theme's neutrals against the background, too close to tell apart
        if (currentIsDark) {
            for (const [slot, weight] of Object.entries(DARK_NEUTRAL_RAMP)) {
                palette[slot] = mixColors(colors.text, colors.background, weight);
            }
        }
        return createTheme({ palette, isInverted: currentIsDark }) as ITheme;
    }

    /** Takes out what the theme designer does that this package does not want, in place. */
    private _normalize(theme: ITheme): ITheme {
        //an input sits on a surface of its own rather than on the one the theme was generated for
        const inputTheme = this._design({
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
        theme.components = this._getComponentStyles(theme);
        return theme;
    }

    /** What a control of this theme looks like where Fluent's own default is not what it wants. */
    private _getComponentStyles(theme: ITheme) {
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

/**
 * A builder starting from a theme, three colours or a Fluent v9 theme.
 *
 * @param source What to start from; Fluent's own default colours where left out.
 */
export const createThemeBuilder = (source?: IThemeBuilderSource): ThemeBuilder => new ThemeBuilder(source);
