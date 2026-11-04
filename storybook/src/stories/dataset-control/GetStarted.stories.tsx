import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { BasicUsageExample, ShowcaseExample } from '../../dataset-control/examples/getStartedExamples'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `
DatasetControl is the frame around a list of records: it loads them for the view the user is on and holds the parts around them, such as a view switcher, a ribbon, quick find and paging. What shows the records is up to you, usually a [**Grid**](?path=/docs/controls-grid-get-started--overview). Try it below: group by a column, then pick *Save as new view* in the view switcher.

{{canvas: Overview}}

## Build your first control

A control needs an \`onLoad\` that returns \`{ provider }\` with the records, and the parts you want around them. \`onLoadViews\` is optional: it lists views for the user to switch between, and \`onLoad\` gets the one they are on. Open **Code**: its comments walk through each step.

{{story: Three deals, two views}}

Like every control, it needs the root providers from [**Quick start**](?path=/docs/concepts-quick-start--overview).

## Add parts

Each part has a page of its own:

- [**Ribbon**](?path=/docs/controls-datasetcontrol-parts-ribbon--overview): commands for the selected records.
- [**Quick find**](?path=/docs/controls-datasetcontrol-parts-quick-find--overview): a search field.
- [**Edit columns**](?path=/docs/controls-datasetcontrol-parts-edit-columns--overview): the user picks the columns of a view.
- [**Paging**](?path=/docs/controls-datasetcontrol-parts-paging--overview): the page size and the pages.
- [**Notifications and empty state**](?path=/docs/controls-datasetcontrol-parts-notifications-and-empty-state--overview): messages above the records, and what shows when there are none.

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Loading data', iconName: 'CloudDownload', href: '?path=/docs/controls-datasetcontrol-loading-data--overview', text: 'When the control loads, what each step does, and loading what every view needs once.' },
    { title: 'Views', iconName: 'ViewList', href: '?path=/docs/controls-datasetcontrol-views--overview', text: 'Named views of the same records, each with its own columns, filter and sorting.' },
    { title: 'Layout', iconName: 'ViewDashboard', href: '?path=/docs/controls-datasetcontrol-layout--overview', text: 'Place the parts in the header and footer, size the control and fit a narrow screen.' },
    { title: 'Error handling', iconName: 'Error', href: '?path=/docs/controls-datasetcontrol-error-handling--overview', text: 'What the user sees when a load, a command or a saved view fails.' },
    { title: 'Talking to the control', iconName: 'Plug', href: '?path=/docs/controls-datasetcontrol-talking-to-the-control--overview', text: 'Switch views, reload and reach every part from your own code.' },
    { title: 'State', iconName: 'History', href: '?path=/docs/controls-datasetcontrol-state--overview', text: 'Each view comes back with its sorting, search, page and scroll.' },
    { title: 'Your own UI', iconName: 'GridViewSmall', href: '?path=/docs/controls-datasetcontrol-your-own-ui--overview', text: 'Replace what a part draws, add parts of your own, or show the records as cards.' },
    { title: 'Localization', iconName: 'LocaleLanguage', href: '?path=/docs/concepts-localization--overview', text: 'Translate or reword every string the control and its parts show.' },
]

const meta = {
    title: 'Controls/DatasetControl/Get started',
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

export const Overview: Story = {
    name: 'Overview',
    render: () => renderStory(<ShowcaseExample />),
}

export const BasicUsage: Story = {
    name: 'Three deals, two views',
    render: () => renderStory(<BasicUsageExample />),
    parameters: {
        docs: {
            description: {
                story: `Three deals in two views. Try: switch to *Won deals*, then search for *Meeting*.`,
            },
        },
    },
}
