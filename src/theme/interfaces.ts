import { ITheme as IBaseTheme, IEffects } from "@fluentui/react";

/** Fluent's theme, with what this package draws on top of it. */
export interface ITheme extends IBaseTheme {
    effects: IEffects & {
        underlined?: boolean
    }
}

/** The three colours a theme is generated from. */
export interface IThemeColors {
    primary: string;
    background: string;
    text: string;
}
