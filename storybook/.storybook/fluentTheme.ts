import { create, getPreferredColorScheme } from 'storybook/theming';
import type { IThemeColors } from '@talxis/base-controls';

export type IColorScheme = 'light' | 'dark';

/** The toolbar global that picks the theme: the system's, or light or dark whatever the system says. */
export const THEME_GLOBAL = 'theme';

//Fluent's palettes: v8's default light, and v9's webDarkTheme
const PALETTES = {
  light: { primary: '#0078d4', app: '#faf9f8', content: '#ffffff', border: '#edebe9', inputBorder: '#c8c6c4', text: '#323130', muted: '#605e5c', inverse: '#ffffff' },
  dark: { primary: '#479ef5', app: '#1f1f1f', content: '#292929', border: '#3d3d3d', inputBorder: '#666666', text: '#ffffff', muted: '#adadad', inverse: '#292929' },
};

/** The scheme a value of the theme global stands for. */
export const resolveColorScheme = (setting: unknown): IColorScheme => setting === 'light' || setting === 'dark' ? setting : getPreferredColorScheme();

/** Calls back whenever the system switches between light and dark. */
export const onSystemColorSchemeChange = (callback: () => void): (() => void) => {
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
};

/** The colours the stories' application theme is generated from, per scheme. */
export const APPLICATION_THEME_COLORS: Record<IColorScheme, IThemeColors> = {
  light: { primary: PALETTES.light.primary, background: PALETTES.light.content, text: PALETTES.light.text },
  dark: { primary: PALETTES.dark.primary, background: PALETTES.dark.content, text: PALETTES.dark.text },
};

const createFluentTheme = (scheme: IColorScheme) => {
  const palette = PALETTES[scheme];
  return create({
    base: scheme,
    brandTitle: '<span style="display: flex; align-items: center; gap: 10px"><img src="logo.png" alt="" width="24" height="24" />Base Controls</span>',
    brandUrl: 'https://github.com/TALXIS/base-controls',
    colorPrimary: palette.primary,
    colorSecondary: palette.primary,
    appBg: palette.app,
    appContentBg: palette.content,
    appPreviewBg: palette.content,
    appBorderColor: palette.border,
    appBorderRadius: 4,
    //Fluent's own font stack, the web font of which manager-head.html loads
    fontBase: '"Segoe UI", "Segoe UI Web (West European)", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
    fontCode: 'Consolas, "Cascadia Mono", Menlo, monospace',
    textColor: palette.text,
    textInverseColor: palette.inverse,
    textMutedColor: palette.muted,
    barTextColor: palette.muted,
    barSelectedColor: palette.primary,
    barHoverColor: palette.primary,
    barBg: palette.content,
    inputBg: palette.content,
    inputBorder: palette.inputBorder,
    inputTextColor: palette.text,
    inputBorderRadius: 4,
  });
};

/** Storybook's own UI and docs pages, per scheme. */
export const FLUENT_THEMES = {
  light: createFluentTheme('light'),
  dark: createFluentTheme('dark'),
};
