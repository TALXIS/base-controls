import { create } from 'storybook/theming';

//Fluent's default palette, the one the controls draw in without a theme of their own
export const fluentTheme = create({
  base: 'light',
  brandTitle: 'Base Controls',
  brandUrl: 'https://github.com/TALXIS/base-controls',
  colorPrimary: '#0078d4',
  colorSecondary: '#0078d4',
  appBg: '#faf9f8',
  appContentBg: '#ffffff',
  appPreviewBg: '#ffffff',
  appBorderColor: '#edebe9',
  appBorderRadius: 4,
  //Fluent's own font stack, the web font of which manager-head.html loads
  fontBase: '"Segoe UI", "Segoe UI Web (West European)", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
  fontCode: 'Consolas, "Cascadia Mono", Menlo, monospace',
  textColor: '#323130',
  textInverseColor: '#ffffff',
  textMutedColor: '#605e5c',
  barTextColor: '#605e5c',
  barSelectedColor: '#0078d4',
  barHoverColor: '#0078d4',
  barBg: '#ffffff',
  inputBg: '#ffffff',
  inputBorder: '#c8c6c4',
  inputTextColor: '#323130',
  inputBorderRadius: 4,
});
