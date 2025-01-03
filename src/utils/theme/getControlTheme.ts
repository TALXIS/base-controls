import { getTheme } from '@fluentui/react';
import { ITheme } from '@talxis/react-components';
import { Theming } from '@talxis/react-components/dist/utilities/theming/Theming'
import { IFluentDesignState } from './interfaces';

export const getControlTheme = (fluentDesignLanguage?: IFluentDesignState): ITheme => {
    let primaryColor;
    let backgroundColor;
    let textColor;
    const tokenTheme = fluentDesignLanguage?.tokenTheme;

    if (!tokenTheme) {
        const baseTheme = getTheme();
        primaryColor = baseTheme.palette.themePrimary;
        backgroundColor = baseTheme.semanticColors.bodyBackground;
        textColor = baseTheme.semanticColors.bodyText;
    }
    else {
        primaryColor = tokenTheme.colorCompoundBrandForeground1;
        backgroundColor = tokenTheme.colorNeutralBackground1;
        textColor = tokenTheme.colorNeutralForeground1;
    }
    const theme = Theming.GenerateThemeV8(primaryColor, backgroundColor, textColor, tokenTheme?.fluentV8Overrides);
    return theme;
}
