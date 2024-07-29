import { createTheme, getTheme, ICheckboxStyleProps, IToggleStyleProps } from '@fluentui/react';
import { createV8Theme } from '@fluentui/react-migration-v8-v9';
import { ITheme } from '../interfaces/theme';

const lightTheme = createTheme({
    palette: {
        white: '#ffffff'
    },
})


export const getControlTheme = (fluentDesignLanguage?: ComponentFramework.FluentDesignState): ITheme => {
    const fluentTheme = getTheme();
    if (!fluentDesignLanguage) {
        return {
            ...fluentTheme, effects: {
                ...fluentTheme.effects,
                underlined: false
            },
            semanticColors: {
                ...fluentTheme.semanticColors,
                inputBorder: 'transparent',
                inputBorderHovered: fluentTheme.palette.black,
            }
        }
    }
    const v8Theme: ITheme = createV8Theme(fluentDesignLanguage.brand, fluentDesignLanguage.tokenTheme);
    v8Theme.semanticColors.inputBackground = fluentDesignLanguage.tokenTheme.inputBackground ?? fluentDesignLanguage.tokenTheme.colorNeutralBackground1Hover;
    v8Theme.semanticColors.inputBorder = fluentDesignLanguage.tokenTheme.inputBorder ?? 'transparent';
    v8Theme.semanticColors.inputBorderHovered = fluentDesignLanguage.tokenTheme.inputBorderHovered ?? v8Theme.semanticColors.inputBorder;
    v8Theme.semanticColors.inputText = fluentDesignLanguage.tokenTheme.inputText ?? v8Theme.semanticColors.inputText;
    v8Theme.semanticColors.inputPlaceholderText = fluentDesignLanguage.tokenTheme.inputPlaceholderText ?? v8Theme.semanticColors.inputText
    v8Theme.semanticColors.inputTextHovered = fluentDesignLanguage.tokenTheme.inputTextHovered ?? v8Theme.semanticColors.inputText;
    v8Theme.effects.underlined = fluentDesignLanguage.tokenTheme.underlined ?? true;
    return normalizeComponentStyling(v8Theme);
}

export const normalizeComponentStyling = (theme: ITheme) => {
    theme.components = {
        Checkbox: {
            styles: (props: ICheckboxStyleProps) => {
                return {
                    root: {
                        ':hover .ms-Checkbox-checkbox': {
                            borderColor: !props.checked ? 'inherit' : undefined
                        }
                    }
                }
            }
        },
        Toggle: {
            styles: (props: IToggleStyleProps) => {
                return {
                    pill: {
                        backgroundColor: !props.checked ? theme.semanticColors.inputBackground : undefined,
                        ':hover': {
                            borderColor: !props.checked ? props.theme.semanticColors.smallInputBorder : undefined
                        },
                    }
                };
            }
        }
    };
    const originalSemanticColors = { ...theme.semanticColors };
    const baseTheme = lightTheme;
    for (const key of Object.keys(baseTheme.semanticColors)) {
        if (key.startsWith('menu') || key.startsWith('list')) {
            //@ts-ignore - a
            theme.semanticColors[key] = baseTheme.semanticColors[key];
        }
    }
    theme.semanticColors.menuIcon = originalSemanticColors.menuIcon;
    return theme;
}