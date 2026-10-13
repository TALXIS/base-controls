import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ShowcaseExample } from '../../dataset-control/examples/getStartedExamples'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `DatasetControl is everything a view of records needs around the records themselves. You load the records in \`onLoad\`, show them in a [grid](?path=/docs/grid-get-started--overview) or anything else, and pick the parts that go around them: views, a ribbon, quick find, column editing, paging and notifications.

Below is a sales pipeline. Switch views, search, sort, select deals to change the ribbon, and open **Code** to read and edit the source.

{{canvas: Overview}}

## Your first DatasetControl

\`\`\`tsx
import { createClientSideRowModelModule, DatasetControl, Grid, IDatasetControlLoadResult, PcfContextProvider } from '@talxis/base-controls'

const loadAccounts = async (): Promise<IDatasetControlLoadResult> => ({ provider: await createAccountsProvider() })

export const Accounts = () => <PcfContextProvider>
    <DatasetControl stateKey='accounts' onLoad={loadAccounts} height='600px'>
        <DatasetControl.Header>
            <DatasetControl.Header.End>
                <DatasetControl.QuickFind />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <Grid stateKey='grid' modules={{ rowModel: createClientSideRowModelModule() }} />
        </DatasetControl.Body>
        <DatasetControl.Footer>
            <DatasetControl.Footer.Start>
                <DatasetControl.PageSizeSwitcher />
            </DatasetControl.Footer.Start>
            <DatasetControl.Footer.End>
                <DatasetControl.Pagination />
            </DatasetControl.Footer.End>
        </DatasetControl.Footer>
    </DatasetControl>
</PcfContextProvider>
\`\`\`

## How it fits together

1. **\`onLoad\` gives the control its records.** It returns a provider for the view the user is on, and the control shows a placeholder until it has loaded. See [**Loading data**](?path=/docs/datasetcontrol-loading-data--overview).
2. **The parts work on that provider.** You place them in the header, the body and the footer, and leave out the ones you don't need. \`Grid\` takes no provider of its own: it uses the control's. See [**Layout**](?path=/docs/datasetcontrol-layout--overview).
3. **Your code talks to the control.** \`useDatasetControl()\` returns it to any component inside, and \`onReady\` to the code that mounts it. Through it you switch views, reload, follow every load, and reach any part: \`control.parts.get('quickFind').search()\`. See [**Talking to the control**](?path=/docs/datasetcontrol-talking-to-the-control--overview).

\`PcfContextProvider\` must wrap the control. See [**PcfContextProvider**](?path=/docs/providers-pcfcontextprovider--overview).

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| \`onLoad\` | \`(params) => Promise<IDatasetControlLoadResult>\` | Required | Returns the provider for a view. See [**Loading data**](?path=/docs/datasetcontrol-loading-data--overview). |
| \`children\` | \`ReactNode\` | Required | The parts. See [**Layout**](?path=/docs/datasetcontrol-layout--overview). |
| \`height\` | \`string\` | None | \`'100%'\` fills the parent; the content's height when left out. |
| \`className\` | \`string\` | None | Added to the control's box. |
| \`stateKey\` | \`string\` | None | Brings the user back where they left off on the next mount. Read once, at mount. See [**State**](?path=/docs/datasetcontrol-state--overview). |
| \`destroyProviderOnUnmount\` | \`boolean\` | \`true\` | Whether the control destroys the providers it lets go of. Set \`false\` for a provider shared with the rest of the page. |
| \`labels\` | \`Partial<IDatasetControlLabels>\` | English | See [**Localization**](?path=/docs/datasetcontrol-localization--overview). |
| \`components\` | \`IDatasetControlComponents\` | Defaults | See [**Appearance**](?path=/docs/datasetcontrol-appearance--overview). |
| \`onReady\` | \`(control: IDatasetControl) => void\` | None | Hands you the control once it exists, before the first load. See [**Talking to the control**](?path=/docs/datasetcontrol-talking-to-the-control--overview). |
| \`onDestroyed\` | \`(control: IDatasetControl) => void\` | None | Hands you the control as it unmounts. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Loading data', iconName: 'CloudDownload', href: '?path=/docs/datasetcontrol-loading-data--overview', text: 'Load each view in your own onLoad, behind a placeholder, with a failed load shown and retried for you.' },
    { title: 'Talking to the control', iconName: 'Plug', href: '?path=/docs/datasetcontrol-talking-to-the-control--overview', text: 'Switch views, reload, follow every load and reach any part from your own code.' },
    { title: 'Every part', iconName: 'Puzzle', href: '?path=/docs/datasetcontrol-parts-views--overview', text: 'Views, a ribbon that follows the selection, quick find, column editing, paging and notifications.' },
    { title: 'Layout that adapts', iconName: 'ResponsiveDesign', href: '?path=/docs/datasetcontrol-layout--overview', text: 'Left and right regions, a height that fills any space, and a header that gives way on a narrow screen.' },
    { title: 'Back where they left off', iconName: 'History', href: '?path=/docs/datasetcontrol-state--overview', text: 'Every view keeps its sorting, search, paging and scroll, and the control reopens on the view the user was on.' },
    { title: 'Your own parts', iconName: 'GridViewSmall', href: '?path=/docs/datasetcontrol-your-own-parts--overview', text: 'Add parts of your own, and show the records as a list, cards or a chart.' },
]

const meta = {
    title: 'DatasetControl/Get started',
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
