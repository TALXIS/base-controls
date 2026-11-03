import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { FirstAppExample } from './quickStartExamples'

const DESCRIPTION = `
Install Base Controls, set up your application once, and add your first control.

## Install

\`\`\`bash
npm install @talxis/base-controls @talxis/client-libraries @fluentui/react@8.121.5
\`\`\`

Base Controls runs on React 16.8 or 17 and Fluent UI 8.121.5 or earlier.

## Your first control

Wrap the application in the shared providers once, then add controls anywhere below them. Here a data provider holds three products, a [**DatasetControl**](?path=/docs/controls-datasetcontrol-get-started--overview) loads it and a [**Grid**](?path=/docs/controls-grid-get-started--overview) draws it. Open **Code** to change it.

{{canvas: Overview}}

The example uses these imports:

\`\`\`tsx
import {
    ApplicationThemeProvider, createClientSideRowModelModule, DatasetControl, Grid, PcfContextProvider, StateProvider,
} from '@talxis/base-controls'
import { DataTypes, MemoryDataProvider } from '@talxis/client-libraries'
\`\`\`

Only \`PcfContextProvider\` is required. Add the others when you need what they provide:

| Provider | Provides | Without it |
|---|---|---|
| \`PcfContextProvider\` | The user, formatting, dialogs and data access: [**PCF context**](?path=/docs/concepts-pcf-context--overview) | The controls throw |
| \`StateProvider\` | Saved state: [**State persistence**](?path=/docs/concepts-state-persistence--overview) | One in-memory store for the page |
| \`ApplicationThemeProvider\` | The theme: [**Theming**](?path=/docs/concepts-theming--overview) | Fluent's default colours |
| \`LabelsProvider\` | Your wording: [**Localization**](?path=/docs/concepts-localization--overview) | English |

## In a PCF control

Pass \`PcfContextProvider\` the context the host hands \`updateView\`: see [**PCF context**](?path=/docs/concepts-pcf-context--overview).

## Next steps

- Put your own records in a provider: [**Data providers**](?path=/docs/concepts-data-providers--overview).
- Switch on sorting, filtering, editing and more: [**Grid**](?path=/docs/controls-grid-get-started--overview).
- Add views, a ribbon and quick find around it: [**DatasetControl**](?path=/docs/controls-datasetcontrol-get-started--overview).

`

const meta = {
    title: 'Concepts/Quick start',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
    name: 'Overview',
    render: () => renderStory(<FirstAppExample />),
}
