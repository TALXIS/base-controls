import { ITheme } from '../interfaces/theme';
import { Theming } from '@talxis/client-libraries';


export const getControlTheme = (fluentDesignLanguage?: ComponentFramework.FluentDesignState): ITheme => {
    return Theming.GetThemeV8FromFluentDesignLanguage(fluentDesignLanguage!) as any;
}
