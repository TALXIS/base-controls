import type { Preview } from '@storybook/react-vite';
import React from 'react';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';
import 'leaflet/dist/leaflet.css';
import { PcfContextProvider } from '@talxis/base-controls/utils';

const preview: Preview = {
  decorators: [
    (Story) => (
      <PcfContextProvider>
        <>
          <style>
            {`
              .sbdocs-content p,
              .sbdocs-content li {
                font-size: 16px;
                line-height: 1.65;
              }

              .form-strategy-hidden-preview.sbdocs-preview {
                display: none;
              }
            `}
          </style>
          <Story />
        </>
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
      defaultViewport: 'responsive',
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          'Form',
          ['Get started', ['Overview', 'Form strategy']],
          'Providers',
        ],
      },
    },
  },
};

export default preview;
