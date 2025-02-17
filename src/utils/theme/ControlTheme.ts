import { getTheme, ITheme } from "@fluentui/react";
import { DeepPartial } from "@talxis/client-libraries";
import { createBrandVariants, createV9Theme } from "@fluentui/react-migration-v8-v9";
import { Theming } from "@talxis/react-components";

export interface IFluentDesignState extends ComponentFramework.FluentDesignState {
    /**
     * Optional overrides that will get applied when v8 theme is generated from fluentDesignLanguage
     */
    v8FluentOverrides?: DeepPartial<ITheme>;
    /**
     * The application's theme may differ from the control's theme. This is often the case when rendering a PCF as a cell customizer with conditional formatting.
     * This object provides access to the application's theme, enabling you to render elements like callouts and other surfaces accurately.
     */
    applicationTheme?: ITheme;
}

export class ControlTheme {
    public static GetV8ThemeFromFluentDesignLanguage(fluentDesignLanguage?: IFluentDesignState): ITheme {
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
        return Theming.GenerateThemeV8(primaryColor, backgroundColor, textColor, fluentDesignLanguage?.v8FluentOverrides);
    }

    public static GenerateFluentDesignLanguage(primaryColor: string, backgroundColor: string, textColor: string, options?: {
        v8FluentOverrides?: DeepPartial<ITheme>;
        applicationTheme?: ITheme
    }): IFluentDesignState {
        const theme = Theming.GenerateThemeV8(primaryColor, backgroundColor, textColor, options?.v8FluentOverrides)
        const v9 = createV9Theme(theme);
        const brand = createBrandVariants(theme.palette);

        return {
            brand: brand,
            applicationTheme: options?.applicationTheme,
            isDarkTheme: Theming.IsDarkColor(theme.semanticColors.bodyBackground),
            v8FluentOverrides: options?.v8FluentOverrides,
            tokenTheme: v9
        };;
    }
}