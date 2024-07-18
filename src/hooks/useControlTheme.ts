import { ITheme as FluentITheme, useTheme } from "@fluentui/react";
import { createV8Theme } from "@fluentui/react-migration-v8-v9";
import { useMemo } from "react";

export interface ITheme extends FluentITheme {
    effects: FluentITheme['effects'] & {
        underlined: boolean;
    }
}

export const useControlTheme = (fluentDesignLanguage?: ComponentFramework.FluentDesignState): ITheme => {
    const fluentTheme = useTheme();

    const getTheme = (): ITheme => {
        if (!fluentDesignLanguage) {
            return {
                ...fluentTheme, effects: {
                    ...fluentTheme.effects,
                    underlined: false
                }
            }
        }
        const v8Theme = createV8Theme(fluentDesignLanguage.brand, fluentDesignLanguage.tokenTheme);
        for (const key of Object.keys(v8Theme.components!)) {
            v8Theme.components![key] = {}
        }
        v8Theme.semanticColors.menuBackground = fluentDesignLanguage.isDarkTheme ? 'black' : 'white'
        return {
            ...v8Theme, effects: {
                ...v8Theme.effects,
                underlined: fluentDesignLanguage.tokenTheme.underlined ?? false
            }
        }
    }
    return useMemo(() => getTheme(), []);
};