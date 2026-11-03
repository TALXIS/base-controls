import { create, getPreferredColorScheme } from 'storybook/theming';
import type { IThemeColors } from '@talxis/base-controls';

/** Storybook's own light or dark, which the UI, the docs and the stories start in. */
export const COLOR_SCHEME = getPreferredColorScheme();

//Fluent's palettes: v8's default light, and v9's webDarkTheme
const PALETTES = {
  light: { primary: '#0078d4', app: '#faf9f8', content: '#ffffff', border: '#edebe9', inputBorder: '#c8c6c4', text: '#323130', muted: '#605e5c', inverse: '#ffffff' },
  dark: { primary: '#479ef5', app: '#1f1f1f', content: '#292929', border: '#3d3d3d', inputBorder: '#666666', text: '#ffffff', muted: '#adadad', inverse: '#292929' },
};

const palette = PALETTES[COLOR_SCHEME];

/** The colours the stories' application theme is generated from, per scheme. */
export const APPLICATION_THEME_COLORS: Record<'light' | 'dark', IThemeColors> = {
  light: { primary: PALETTES.light.primary, background: PALETTES.light.content, text: PALETTES.light.text },
  dark: { primary: PALETTES.dark.primary, background: PALETTES.dark.content, text: PALETTES.dark.text },
};

/** The background switch in the toolbar, whose choice the stories draw in. */
export const BACKGROUNDS = {
  light: { name: 'Light', value: PALETTES.light.content },
  dark: { name: 'Dark', value: PALETTES.dark.content },
};

export const fluentTheme = create({
  base: COLOR_SCHEME,
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
