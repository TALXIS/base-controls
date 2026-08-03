import type { Preview } from '@storybook/react'
import React from 'react'
import { initializeIcons, ThemeProvider } from '@fluentui/react'
import { PcfContextProvider, useControlTheme } from '@talxis/base-controls'
import 'leaflet/dist/leaflet.css'

const docsTextStyles = `
  .sbdocs .form-docs-copy,
  .sbdocs-content .form-docs-copy,
  .docs-story .form-docs-copy {
    font-size: 18px !important;
    line-height: 1.75 !important;
    color: #24292f !important;
  }

  .sbdocs .form-docs-copy p,
  .sbdocs-content .form-docs-copy p,
  .docs-story .form-docs-copy p {
    margin: 0 0 18px !important;
    font-size: inherit !important;
    line-height: inherit !important;
    color: inherit !important;
  }

  .sbdocs .form-docs-copy a,
  .sbdocs-content .form-docs-copy a,
  .docs-story .form-docs-copy a {
    color: #0969da !important;
    text-decoration: none;
  }

  .sbdocs .form-docs-copy a:hover,
  .sbdocs-content .form-docs-copy a:hover,
  .docs-story .form-docs-copy a:hover {
    text-decoration: underline;
  }

  .sbdocs .form-docs-copy code,
  .sbdocs-content .form-docs-copy code,
  .docs-story .form-docs-copy code {
    font-size: 0.95em;
  }
`

initializeIcons()

const StorybookProviders = (props: { children: React.ReactNode }) => {
    const controlTheme = useControlTheme()

    return <ThemeProvider theme={controlTheme}>
        <PcfContextProvider>
            <style>{docsTextStyles}</style>
            {props.children}
        </PcfContextProvider>
    </ThemeProvider>
}

const preview: Preview = {
    parameters: {
        layout: 'fullscreen',
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/,
            },
        },
        options: {
            showPanel: false,
            storySort: {
                order: ['Form'],
            },
        },
    },
    decorators: [
        (Story) => <StorybookProviders>
            <Story />
        </StorybookProviders>,
    ],
}

export default preview
