import { ITheme as IFluentTheme } from '@fluentui/react';
export interface ITheme extends IFluentTheme {
    effects: IFluentTheme['effects'] & {
        underlined?: boolean;
    }
}