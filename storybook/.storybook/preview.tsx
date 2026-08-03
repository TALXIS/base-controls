import type { Preview } from '@storybook/react-vite';
import React from 'react';
import 'leaflet/dist/leaflet.css';
import { PcfContextProvider } from '@talxis/base-controls/utils';


const preview: Preview = {
  decorators: [
    (Story) => (
      <PcfContextProvider>
        <Story />
      </PcfContextProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
