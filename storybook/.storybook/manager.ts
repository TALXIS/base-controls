import { addons } from 'storybook/manager-api';
import { GLOBALS_UPDATED, SET_GLOBALS } from 'storybook/internal/core-events';
import { FLUENT_THEMES, onSystemColorSchemeChange, resolveColorScheme, THEME_GLOBAL } from './fluentTheme';

let themeSetting: unknown;

//manager-head.html picks its colours by the attribute
const getManagerTheme = () => {
  const scheme = resolveColorScheme(themeSetting);
  document.documentElement.dataset.colorScheme = scheme;
  return FLUENT_THEMES[scheme];
};

addons.setConfig({ theme: getManagerTheme() });

addons.register('base-controls/theme', api => {
  const apply = () => api.setOptions({ theme: getManagerTheme() });
  const onGlobals = ({ globals }: { globals: Record<string, unknown> }) => {
    themeSetting = globals[THEME_GLOBAL];
    apply();
  };
  const channel = addons.getChannel();
  channel.on(SET_GLOBALS, onGlobals);
  channel.on(GLOBALS_UPDATED, onGlobals);
  onSystemColorSchemeChange(apply);
});
