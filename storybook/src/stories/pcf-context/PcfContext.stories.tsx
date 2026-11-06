import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { DialogsExample, FormatExample } from './pcfContextExamples'

const DESCRIPTION = `
Controls need things only their host knows: who the user is, how to format their dates, numbers and money, and how to open a dialog or reach data. Power Apps hands this to every PCF control as its *context*, and one \`PcfContextProvider\` at the root shares it with every control below, or builds one outside Power Apps. Try it below: pick another culture and watch the invoice follow.

{{canvas: Format for the user}}

## What it holds

Put the provider at the root of the application, as in [**Quick start**](?path=/docs/concepts-quick-start--overview), and read the context anywhere below it with \`usePcfContext()\`. Every control below it shares:

| Member | Holds |
|---|---|
| \`userSettings\` | The user and their language |
| \`formatting\` | The formatting of dates, numbers and money |
| \`navigation\` | The host's dialogs, and opening records and pages |
| \`webAPI\`, \`utils\` | The host's data and metadata |
| \`mode\` | Whether the control is enabled and visible, and \`setControlState\` |

To show an error, \`useOpenErrorDialog()\` returns a function that opens the error dialog with a \`title\` and \`details\`.

## In a PCF control

Pass the context the host hands \`updateView\` to the provider, as \`index.tsx\` in the example at the top does. Everything in it is used as it is, except \`formatting\`: that is always the library's own, built from \`userSettings.languageId\` and \`formatInfoCultureName\`, so the controls format the same way in every host. The user settings' \`numberFormattingInfo\` and \`dateFormattingInfo\` are set to match it.

## Outside a PCF control

Without a \`context\`, the provider builds one. On a page that has \`window.Xrm\`, such as a model-driven app, \`navigation\`, \`webAPI\` and \`utils\` come from it; on a page without it, the first provider sets \`window.Xrm\` from its \`userSettings\`. Everything else is filled in as below.

| Part | Filled in as |
|---|---|
| \`userSettings\`, \`formatting\` | From the \`userSettings\` prop: \`lcid\` and \`formatInfoCultureName\`, \`1033\` and \`'en-US'\` when left out |
| \`navigation\` dialogs | \`openAlertDialog\`, \`openConfirmDialog\` and \`openErrorDialog\` open the browser's own |
| \`openForm\`, \`navigateTo\` and the rest of \`navigation\` | Throw |
| \`webAPI\`, \`utils.getEntityMetadata\` | Throw, so load data through providers of your own |
| \`device\`, \`resources\`, \`factory.getPopupService\` | Throw |
| \`mode\` | Enabled and visible, with \`setControlState\` accepted |

The provider builds the context again on every render, so \`usePcfContext()\` sees a change of \`userSettings\` at once. Controls such as the grid keep the context they mounted with: remount them with a new \`key\`.

{{story: Ask the user}}

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Quick start', iconName: 'Rocket', href: '?path=/docs/concepts-quick-start--overview', text: 'The providers at the root of an application, the PCF context among them.' },
    { title: 'Localization', iconName: 'LocaleLanguage', href: '?path=/docs/concepts-localization--overview', text: 'Translate the strings the controls draw, beside the culture that formats values.' },
    { title: 'State persistence', iconName: 'History', href: '?path=/docs/concepts-state-persistence--overview', text: 'Keep what the user left for the session, through the host\'s mode.' },
]

const meta = {
    title: 'Concepts/PCF context',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { explore: () => <ExploreCards cards={EXPLORE} /> }),
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
}

export const AskTheUser: Story = {
    name: 'Ask the user',
    render: () => renderStory(<DialogsExample />),
    parameters: {
        docs: {
            description: {
                story: `A confirmation and an alert through \`usePcfContext().navigation\`, with the browser's own dialogs standing in for a host. Try: click **Archive**.`,
            },
        },
    },
}
