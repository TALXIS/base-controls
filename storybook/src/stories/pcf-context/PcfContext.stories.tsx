import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { DialogsExample, FormatExample } from './pcfContextExamples'

const DESCRIPTION = `
The context ties the controls to the host they run in. Through it, every control below one \`PcfContextProvider\` shares the same user, language and formatting, and calls on the host to open dialogs and records or to reach its data. It takes the shape of a PCF context, so a Power Apps host's own fits it as it is. \`usePcfContext()\` reads it anywhere below the provider, and a control without one throws.

\`\`\`tsx
import { PcfContextProvider } from '@talxis/base-controls'

<PcfContextProvider>
    <App />
</PcfContextProvider>
\`\`\`

## Inside a PCF control

Pass the context the host hands you, and the controls use it as it is:

\`\`\`tsx
//updateView(context)
<PcfContextProvider context={context}>
    <App />
</PcfContextProvider>
\`\`\`

## Outside a host

Without a \`context\`, the provider builds one. On a page that has \`window.Xrm\`, such as a model-driven app, it uses it; otherwise it fills each part in itself, and sets \`window.Xrm\` for the page once:

| Part | Without a host |
|---|---|
| \`userSettings\`, \`formatting\` | From the \`userSettings\` prop: \`lcid\` and \`formatInfoCultureName\`, \`1033\` and \`'en-US'\` when left out |
| \`navigation\` | Alerts, confirmations and errors open as the browser's own dialogs; opening forms and records is not available |
| \`webAPI\`, \`utils.getEntityMetadata\` | Not available: they throw, so load data through providers of your own |
| \`mode\` | Enabled and visible, with \`setControlState\` accepted |

The context is built again on every render, so a change of \`userSettings\` applies at once.

{{story: Format for the user}}

{{story: Ask the user}}

`

const meta = {
    title: 'PCF context',
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

export const FormatForTheUser: Story = {
    name: 'Format for the user',
    render: () => renderStory(<FormatExample />),
    parameters: {
        docs: {
            description: {
                story: `An invoice formatted from \`usePcfContext().formatting\`, with the culture passed in \`userSettings\`. Pick another culture to see dates, money and durations follow it.`,
            },
        },
    },
}

export const AskTheUser: Story = {
    name: 'Ask the user',
    render: () => renderStory(<DialogsExample />),
    parameters: {
        docs: {
            description: {
                story: `A confirmation and an alert through \`usePcfContext().navigation\`, with no host: the browser's own dialogs stand in.`,
            },
        },
    },
}
