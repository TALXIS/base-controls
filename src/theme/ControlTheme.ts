import { getTheme } from "@fluentui/react";
import { DeepPartial } from "@talxis/client-libraries";
import { createBrandVariants, createV9Theme } from "@fluentui/react-migration-v8-v9";
import { ITheme, Theming } from "@legacy";
import { MemoryCache } from '@talxis/client-libraries/dist/helpers/cache/MemoryCache';

/**
 * `createV9Theme` builds a ~400-key token object and `createBrandVariants` mixes 16 colours, and a single
 * grid cell asks for both twice while it mounts. Cloning is off on purpose: the entries are treated as
 * immutable, and cloning one would cost more than rebuilding it.
 */
const derivedThemeCache = new MemoryCache<{ brand: ComponentFramework.FluentDesignState['brand']; tokenTheme: ComponentFramework.FluentDesignState['tokenTheme']; isDarkTheme: boolean }>(true);

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
        //only an override that names itself can be keyed - see Theming.GenerateThemeV8
        const overrideId = (options?.v8FluentOverrides as ITheme | undefined)?.id;
        const derive = () => {
            const theme = Theming.GenerateThemeV8(primaryColor, backgroundColor, textColor, options?.v8FluentOverrides);
            return {
                brand: createBrandVariants(theme.palette),
                tokenTheme: createV9Theme(theme),
                isDarkTheme: Theming.IsDarkColor(theme.semanticColors.bodyBackground),
            };
        };
        const derived = overrideId
            ? derivedThemeCache.get(`${primaryColor}_${backgroundColor}_${textColor}_${overrideId}`, derive)
            : derive();

        //the wrapper is rebuilt every call so the caller's own applicationTheme and overrides can never be
        //served from a previous caller
        return {
            brand: derived.brand,
            applicationTheme: options?.applicationTheme,
            isDarkTheme: derived.isDarkTheme,
            v8FluentOverrides: options?.v8FluentOverrides,
            tokenTheme: derived.tokenTheme
        };
    }
}