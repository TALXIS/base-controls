import type { Preview } from '@storybook/react-vite';
import React from 'react';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';
import 'leaflet/dist/leaflet.css';
import { ApplicationThemeProvider, createThemeBuilder, PcfContextProvider, StateProvider } from '@talxis/base-controls';
import { APPLICATION_THEME_COLORS, BACKGROUNDS, COLOR_SCHEME, fluentTheme } from './fluentTheme';
import { ModuleRegistry, ValidationModule } from 'ag-grid-community';

//names any AG Grid module a grid uses but the library does not register
ModuleRegistry.registerModules([ValidationModule]);

const APPLICATION_THEMES = {
  light: createThemeBuilder({ colors: APPLICATION_THEME_COLORS.light }).getTheme(),
  dark: createThemeBuilder({ colors: APPLICATION_THEME_COLORS.dark }).getTheme(),
};

//the background switch in the toolbar, or Storybook's own scheme until it is used
const getColorScheme = (background: string | undefined): 'light' | 'dark' => background === 'light' || background === 'dark' ? background : COLOR_SCHEME;

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
    (Story, context) => (
      <PcfContextProvider>
        <StateProvider>
          {/* keyed: the controls read the theme as they mount */}
          <ApplicationThemeProvider key={getColorScheme(context.globals.backgrounds?.value)} theme={APPLICATION_THEMES[getColorScheme(context.globals.backgrounds?.value)]}>
            <Story />
          </ApplicationThemeProvider>
        </StateProvider>
      </PcfContextProvider>
    ),
  ],
  initialGlobals: {
    backgrounds: { value: COLOR_SCHEME },
  },
  parameters: {
    layout: 'fullscreen',
    docs: { theme: fluentTheme },
    backgrounds: { options: BACKGROUNDS },
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
          ['Introduction', 'Quick start', 'Data providers', 'Localization', 'Theming', 'Layout', ['Overview', 'Compact parts'], 'State persistence', 'PCF context', 'Control isolation'],
          'Controls',
          [
            'DatasetControl',
            [
              'Get started',
              'Loading data',
              'Error handling',
              'Views',
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
