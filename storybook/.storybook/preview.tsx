import type { Preview } from '@storybook/react-vite';
import React, { useEffect, useState } from 'react';
import { DocsContainer, DocsContainerProps } from '@storybook/addon-docs/blocks';
import { GLOBALS_UPDATED } from 'storybook/internal/core-events';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';
import 'leaflet/dist/leaflet.css';
import { AppThemeProvider, createThemeBuilder, PcfContextProvider, StateProvider } from '@talxis/base-controls';
import { APPLICATION_THEME_COLORS, FLUENT_THEMES, onSystemColorSchemeChange, resolveColorScheme, THEME_GLOBAL } from './fluentTheme';
import { ModuleRegistry, ValidationModule } from 'ag-grid-community';

//names any AG Grid module a grid uses but the library does not register
ModuleRegistry.registerModules([ValidationModule]);

const APPLICATION_THEMES = {
  light: createThemeBuilder({ colors: APPLICATION_THEME_COLORS.light }).getTheme(),
  dark: createThemeBuilder({ colors: APPLICATION_THEME_COLORS.dark }).getTheme(),
};

/** The scheme the theme toggle stands for, following the system while it is on System. */
const useColorScheme = (setting: unknown) => {
  const [scheme, setScheme] = useState(() => resolveColorScheme(setting));
  useEffect(() => {
    setScheme(resolveColorScheme(setting));
    return onSystemColorSchemeChange(() => setScheme(resolveColorScheme(setting)));
  }, [setting]);
  //preview-head.html paints the page by the attribute
  useEffect(() => {
    document.documentElement.dataset.colorScheme = scheme;
  }, [scheme]);
  return scheme;
};

const StoryProviders = (props: { themeSetting: unknown; children: React.ReactNode }) => {
  const scheme = useColorScheme(props.themeSetting);
  return <PcfContextProvider>
    <StateProvider>
      {/* keyed: the controls read the theme as they mount */}
      <AppThemeProvider key={scheme} theme={APPLICATION_THEMES[scheme]}>
        {props.children}
      </AppThemeProvider>
    </StateProvider>
  </PcfContextProvider>;
};

interface IDocsContextWithStore {
  store?: { userGlobals?: { globals?: Record<string, unknown> } };
}

//docs pages take their theme as a parameter, read once, so the toggle reaches them through the channel
const ThemedDocsContainer = (props: React.PropsWithChildren<DocsContainerProps>) => {
  const [themeSetting, setThemeSetting] = useState<unknown>((props.context as unknown as IDocsContextWithStore).store?.userGlobals?.globals?.[THEME_GLOBAL]);
  const scheme = useColorScheme(themeSetting);
  useEffect(() => {
    const onGlobals = ({ globals }: { globals: Record<string, unknown> }) => setThemeSetting(globals[THEME_GLOBAL]);
    props.context.channel.on(GLOBALS_UPDATED, onGlobals);
    return () => props.context.channel.off(GLOBALS_UPDATED, onGlobals);
  }, [props.context.channel]);
  return <DocsContainer {...props} theme={FLUENT_THEMES[scheme]} />;
};

//Storybook's focus getter throws when read off HTMLElement.prototype, which Fluent v9's keyborg does
const guardPrototypeFocus = () => {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'focus');
  if (!descriptor?.get || descriptor.get.name === 'guardedFocus') {
    return {};
  }
  const get = descriptor.get;
  Object.defineProperty(HTMLElement.prototype, 'focus', {
    ...descriptor,
    get: function guardedFocus(this: HTMLElement) {
      return get.call(this === HTMLElement.prototype ? document.createElement('div') : this);
    },
  });
  return {};
};

const preview: Preview = {
  loaders: [guardPrototypeFocus],
  decorators: [
    (Story, context) => <StoryProviders themeSetting={context.globals[THEME_GLOBAL]}><Story /></StoryProviders>,
  ],
  globalTypes: {
    [THEME_GLOBAL]: {
      description: 'Light or dark, for Storybook and the stories',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        dynamicTitle: true,
        items: [
          { value: 'system', title: 'System', icon: 'browser' },
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
      },
    },
  },
  initialGlobals: {
    [THEME_GLOBAL]: 'system',
  },
  parameters: {
    layout: 'fullscreen',
    docs: { container: ThemedDocsContainer },
    viewport: {
      options: {
        ...INITIAL_VIEWPORTS,
        formDesktop: {
          name: 'Form desktop',
          styles: {
            width: '960px',
            height: '100%',
          },
          type: 'desktop',
        },
        formTablet: {
          name: 'Form tablet',
          styles: {
            width: '768px',
            height: '100%',
          },
          type: 'tablet',
        },
        formMobile: {
          name: 'Form mobile',
          styles: {
            width: '390px',
            height: '100%',
          },
          type: 'mobile',
        },
      },
    },
    initialGlobals: {
      viewport: { value: 'responsive', isRotated: false },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      showPanel: false,
      storySort: {
        order: [
          'Concepts',
          ['Introduction', 'Quick start', 'Data providers', 'Localization', 'Theming', 'Fluent UI', 'Layout', ['Overview', 'Compact parts'], 'State persistence', 'PCF context', 'Control isolation'],
          'Controls',
          [
            'DatasetControl',
            [
              'Get started',
              'Loading data',
              'Error handling',
              'Views',
              ['Overview', 'User views'],
              'Layout',
              'Talking to the control',
              'Parts',
              ['Ribbon', 'Quick find', 'Edit columns', 'Paging', 'Notifications and empty records'],
              'State',
              'Your own UI',
            ],
            'Grid',
            [
              'Get started',
              'Data',
              'Columns',
              'Modules',
              ['Overview', 'Editing', 'Selection and clipboard', 'Sorting and filtering', 'Grouping and totals', 'Legacy client API'],
              'Appearance',
              ['Overview', 'Custom cells', 'Custom headers', 'Overlays and rows'],
              'State',
              'Talking to the grid',
              'Extending',
              ['Write a module', 'Hooks', 'AG Grid'],
              'Props and events',
            ],
            'TaskGrid',
            [
              'Get started',
              'Loading tasks',
              'Views and the tree',
              'Working with tasks',
              'Modules',
              ['Overview', 'Project', 'Custom columns', 'Lookup many', 'Templates', 'Checklist', 'Dependencies'],
              'Talking to the task grid',
              'Gantt',
              [
                'Get started',
                'Modules',
                ['Overview', 'Editing on the timeline', 'Markers', 'Non-working days', 'Tooltip', 'Links'],
                'Write a module',
              ],
            ],
            'Checklist',
            ['Get started', 'Customization', 'Saving changes'],
            'Form',
            [
              'Get started',
              ['Overview', 'Form strategy'],
              'React compose',
              ['Overview', 'Custom Components', 'Layout'],
              'Xrm',
              [
                'Overview',
                'FormXml Builder',
                'Custom Components',
                ['Form Context', 'Overview', 'Samples'],
              ],
            ],
            'Map',
          ],
          'Dev',
          ['DatasetControl', 'Grid', 'TaskGrid', 'Checklist', 'Form'],
        ],
      },
    },
  },
};

export default preview;
