import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { FirstAppExample } from './quickStartExamples'

const DESCRIPTION = `
Install Base Controls, set up your application once, and add your first control.

## Install

\`\`\`bash
npm install @talxis/base-controls @talxis/client-libraries @fluentui/react
\`\`\`

## Your first control

Wrap the application in the shared providers once, then add controls anywhere below them. Here a data provider holds three products, a \`DatasetControl\` loads it and a \`Grid\` draws it. Open **Code** to change it.

{{canvas: Overview}}

| Provider | Hands down | Without it |
|---|---|---|
| \`PcfContextProvider\` | The user, formatting and host: [**PCF context**](?path=/docs/concepts-pcf-context--overview) | Required |
| \`ApplicationThemeProvider\` | The theme: [**Theming**](?path=/docs/concepts-theming--overview) | Fluent's default colours |
| \`StateProvider\` | Saved state: [**State persistence**](?path=/docs/concepts-state-persistence--overview) | One in-memory store for the page |
| \`LabelsProvider\` | Your wording: [**Localization**](?path=/docs/concepts-localization--overview) | English |

## In a PCF control

Pass the host's context, and the controls use its user, formatting and data:

\`\`\`tsx
<PcfContextProvider context={context}>
    <App />
</PcfContextProvider>
\`\`\`

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
