import type { Preview } from '@storybook/react-vite';
import React from 'react';
import { ThemeProvider } from '@fluentui/react';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';
import 'leaflet/dist/leaflet.css';
import { PcfContextProvider, usePcfContext } from '@talxis/base-controls/utils';
import { useControlTheme } from '@talxis/base-controls/hooks';

const StorybookProviders = ({ children }: { children?: React.ReactNode }) => {
  const context = usePcfContext();
  const theme = useControlTheme(context.fluentDesignLanguage);

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
          'Providers',
        ],
      },
    },
  },
};

export default preview;
