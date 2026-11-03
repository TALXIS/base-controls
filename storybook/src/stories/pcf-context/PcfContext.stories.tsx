import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { DialogsExample, FormatExample } from './pcfContextExamples'

const DESCRIPTION = `
The context ties the controls to the host they run in. It takes the shape of a PCF context, so a Power Apps host's own can be passed straight in, and every control below one \`PcfContextProvider\` shares:

- the user and their language, in \`userSettings\`
- the formatting of dates, numbers and money, in \`formatting\`
- the host's dialogs, records and data, in \`navigation\`, \`webAPI\` and \`utils\`

Put the provider at the root of the application, as in [**Quick start**](?path=/docs/concepts-quick-start--overview), and read the context anywhere below it with \`usePcfContext()\`.

{{story: Format for the user}}

## In a PCF control

Pass the context the host hands you:

\`\`\`tsx
//updateView(context)
<PcfContextProvider context={context}>
    <App />
</PcfContextProvider>
\`\`\`

- Its \`userSettings\`, \`navigation\`, \`webAPI\`, \`utils\`, \`mode\` and the rest are used as they are.
- \`formatting\` is always the library's own, built from \`userSettings.languageId\` and \`formatInfoCultureName\`, so the controls format the same way in every host. The user settings' \`numberFormattingInfo\` and \`dateFormattingInfo\` are set to match it.

## Outside a PCF control

Without a \`context\`, the provider builds one:

- On a page that has \`window.Xrm\`, such as a model-driven app, \`navigation\`, \`webAPI\` and \`utils\` come from it.
- On a page without it, the first provider sets \`window.Xrm\` from its \`userSettings\`.
- Everything else is filled in as below.

| Part | Filled in as |
|---|---|
| \`userSettings\`, \`formatting\` | From the \`userSettings\` prop: \`lcid\` and \`formatInfoCultureName\`, \`1033\` and \`'en-US'\` when left out |
| \`navigation\` | \`openAlertDialog\`, \`openConfirmDialog\` and \`openErrorDialog\` open the browser's own dialogs; \`openForm\`, \`navigateTo\`, \`openUrl\`, \`openFile\` and \`openWebResource\` throw |
| \`webAPI\`, \`utils.getEntityMetadata\` | Throw, so load data through providers of your own |
| \`device\`, \`resources\`, \`factory.getPopupService\` | Throw |
| \`mode\` | Enabled and visible, with \`setControlState\` accepted |

The provider builds the context again on every render, so \`usePcfContext()\` sees a change of \`userSettings\` at once. Controls such as the grid keep the context they mounted with: remount them with a new \`key\`.

{{story: Ask the user}}

`

const meta = {
    title: 'Concepts/PCF context',
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
                story: `An invoice formatted from \`usePcfContext().formatting\`, with the culture passed in \`userSettings\`. Try: pick another culture.`,
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
                story: `A confirmation and an alert through \`usePcfContext().navigation\`, with the browser's own dialogs standing in for a host. Try: click *Archive* and cancel, then confirm.`,
            },
        },
    },
}
