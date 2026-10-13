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

const preview: Preview = {
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
          'DatasetControl',
          [
            'Get started',
            ['Overview', 'Loading data', 'Layout', 'State'],
            'Parts',
            ['Views', 'Ribbon', 'Quick find', 'Edit columns', 'Paging', 'Notifications and empty records'],
            'Customization',
            ['Localization', 'Appearance', 'Your own parts'],
            'API',
            ['DatasetControl', 'Parts', 'Hooks and types'],
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
            ['Overview', 'Data', 'Props and events'],
            'Modules',
            ['Overview', 'Editing', 'Selection and clipboard', 'Sorting and filtering', 'Grouping and totals', 'Legacy client API'],
            'Columns',
            'State',
            'Appearance',
            ['Overview', 'Custom cells', 'Custom headers', 'Custom overlays', 'Custom rows', 'Module parts'],
            'Localization',
            'Extending',
            ['Overview', 'Hooks', 'Write a module', 'AG Grid'],
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
