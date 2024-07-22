import { createTheme, getTheme } from '@fluentui/react';
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
            }
        }
    }
    const v8Theme: ITheme = createV8Theme(fluentDesignLanguage.brand, fluentDesignLanguage.tokenTheme);
    v8Theme.semanticColors.inputBackground = fluentDesignLanguage.tokenTheme.inputBackground ?? fluentDesignLanguage.tokenTheme.colorNeutralBackground1Hover;
    v8Theme.semanticColors.inputBorder = fluentDesignLanguage.tokenTheme.inputBorder ?? 'transparent';
    v8Theme.semanticColors.inputBorderHovered = fluentDesignLanguage.tokenTheme.inputBorderHovered ?? v8Theme.semanticColors.inputBorder;
    v8Theme.semanticColors.inputText = fluentDesignLanguage.tokenTheme.inputText ?? v8Theme.semanticColors.inputText;
    v8Theme.semanticColors.inputPlaceholderText = fluentDesignLanguage.tokenTheme.inputPlaceholderText ?? v8Theme.semanticColors.inputText
    v8Theme.semanticColors.inputTextHovered = v8Theme.semanticColors.inputText;
    v8Theme.effects.underlined = fluentDesignLanguage.tokenTheme.underlined ?? false;

    v8Theme.components = {
        Checkbox: {
            styles: {
                root: {
                    ':hover .ms-Checkbox-checkbox': {
                        borderColor: 'inherit'
                    }
                }
            }
        }
    };
    return normalizeLayerComponentColors(v8Theme);
}

export const normalizeLayerComponentColors = (theme: ITheme) => {
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