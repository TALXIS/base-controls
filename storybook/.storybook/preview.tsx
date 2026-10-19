import type { Preview } from '@storybook/react-vite';
import React from 'react';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';
import 'leaflet/dist/leaflet.css';
import { PcfContextProvider, StateProvider, ThemeGenerator, ThemeProvider } from '@talxis/base-controls';
import { ModuleRegistry, ValidationModule } from 'ag-grid-community';

//names any AG Grid module a grid uses but the library does not register
ModuleRegistry.registerModules([ValidationModule]);

//the theme every story is drawn in: a control takes what is above it, and this is what is above them.
//Teams light: its brand purple, its surface and its foreground
const theme = ThemeGenerator.generate({ primary: '#5B5FC7', background: '#ffffff', text: '#242424' });

const StorybookProviders = ({ children }: { children?: React.ReactNode }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
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
    (Story) => (
      <PcfContextProvider>
        <StateProvider>
          <StorybookProviders>
            <>
              <style>
                {`
                  .sbdocs-content p,
                  .sbdocs-content li {
                    font-size: 16px;
                    line-height: 1.65;
                  }

                  .form-strategy-hidden-preview.sbdocs-preview,
                  .docs-hidden-preview.sbdocs-preview {
                    display: none;
                  }
                `}
              </style>
              <Story />
            </>
          </StorybookProviders>
        </StateProvider>
      </PcfContextProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
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
          'Data providers',
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
            'Localization',
            'Dev',
          ],
          'Task Grid',
          [
            'Get started',
            'Descriptors',
            [
              'Anatomy',
              'Memory',
              ['Overview', 'Task options', 'Feature data', 'Your data'],
              'Dataverse',
              ['Overview', 'Task options', 'Feature data'],
              'Talxis platform',
            ],
            'Modules',
            ['Overview', 'Customizer'],
            'Customizations',
            ['Overview', 'Custom cells', 'Custom headers', 'Overlays and modules'],
            'Extending',
            [
              'Overview',
              'Reuse a shipped strategy',
              'Extend a shipped strategy',
              'Write your own',
            ],
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
            'Localization',
            'Talking to the grid',
            'Extending',
            ['Write a module', 'Hooks', 'AG Grid'],
            'Props and events',
            'Dev',
          ],
          'Map',
          'Checklist',
          ['Get started', 'Customization', 'Saving changes', 'Dev'],
          'Providers',
        ],
      },
    },
  },
};

export default preview;
