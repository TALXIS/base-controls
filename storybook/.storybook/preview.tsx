import type { Preview } from '@storybook/react-vite';
import React from 'react';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';
import 'leaflet/dist/leaflet.css';
import { PcfContextProvider, Theming, ThemeProvider } from '@talxis/base-controls';

//the theme every story is drawn in: a control takes what is above it, and this is what is above them.
//Teams light: its brand purple, its surface and its foreground
const theme = Theming.GenerateThemeV8('#5B5FC7', '#ffffff', '#242424');

const StorybookProviders = ({ children }: { children?: React.ReactNode }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

const preview: Preview = {
  decorators: [
    (Story) => (
      <PcfContextProvider>
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
            ['Overview', 'Custom Components'],
            'Extending',
            [
              'Overview',
              'Reuse a shipped strategy',
              'Extend a shipped strategy',
              'Write your own',
            ],
          ],
          'Map',
          'Checklist',
          ['Get started', 'Reacting to changes', 'Dev'],
          'Providers',
        ],
      },
    },
  },
};

export default preview;
