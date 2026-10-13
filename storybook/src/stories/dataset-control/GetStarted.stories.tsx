import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ShowcaseExample } from '../../dataset-control/examples/getStartedExamples'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `DatasetControl is everything a view of records needs around the records themselves. You load the records in \`onLoad\`, show them in a [grid](?path=/docs/grid-get-started--overview), a list or cards, and pick the parts that go around them:

- [**Views**](?path=/docs/datasetcontrol-parts-views--overview): switch between views of the records, each loaded by your code.
- [**Ribbon**](?path=/docs/datasetcontrol-parts-ribbon--overview): commands for the selected records.
- [**Quick find**](?path=/docs/datasetcontrol-parts-quick-find--overview): search the records.
- [**Edit columns**](?path=/docs/datasetcontrol-parts-edit-columns--overview): let the user add, remove and reorder columns.
- [**Paging**](?path=/docs/datasetcontrol-parts-paging--overview), [**notifications and an empty state**](?path=/docs/datasetcontrol-parts-notifications-and-empty-records--overview) around the records.

Every view comes back the way the user left it, and the control fits whatever space you give it.

Below is a sales pipeline in a grid. Switch views, search, sort, select deals to change the ribbon, and open **Code** to read and edit the source.

{{canvas: Overview}}

## What you get

{{block: explore}}

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

- \`onLoad\` returns the provider every part works on. Until it has loaded, a placeholder stands in for the control. See [**Loading data**](?path=/docs/datasetcontrol-get-started-loading-data--overview).
- \`height\` sizes the control, and what shows the records fills what the header and the footer leave. \`Header\`, \`Body\` and \`Footer\`, with their \`Start\` and \`End\` regions, place the parts. See [**Layout**](?path=/docs/datasetcontrol-get-started-layout--overview).
- \`Grid\` takes no provider: it gets the one \`onLoad\` returned.
- \`stateKey\` brings the user back where they left off the next time the control mounts. See [**State**](?path=/docs/datasetcontrol-get-started-state--overview).
- \`PcfContextProvider\` must wrap the control. See [**PcfContextProvider**](?path=/docs/providers-pcfcontextprovider--overview).

Every prop, member and type is listed on [**API**](?path=/docs/datasetcontrol-api-datasetcontrol--overview).
`

const EXPLORE: IExploreCard[] = [
    { title: 'Loading data', iconName: 'CloudDownload', href: '?path=/docs/datasetcontrol-get-started-loading-data--overview', text: 'Load the provider for each view in your own onLoad, behind a placeholder, with a failed load shown and retried for you.' },
    { title: 'Every part', iconName: 'Puzzle', href: '?path=/docs/datasetcontrol-parts-views--overview', text: 'Views, a ribbon that follows the selection, quick find, column editing, notifications, an empty state and paging.' },
    { title: 'Layout that adapts', iconName: 'ResponsiveDesign', href: '?path=/docs/datasetcontrol-get-started-layout--overview', text: 'Left and right regions that keep their places, a height that fills any space, and a header that gives way on a narrow screen.' },
    { title: 'Back where they left off', iconName: 'History', href: '?path=/docs/datasetcontrol-get-started-state--overview', text: 'Every view keeps its sorting, search, paging and scroll, and the control reopens on the view the user was on.' },
    { title: 'Your own parts', iconName: 'GridViewSmall', href: '?path=/docs/datasetcontrol-customization-your-own-parts--overview', text: 'Add parts of your own, drive the control from code, and show the records as a list, cards or a chart.' },
    { title: 'Make it yours', iconName: 'Color', href: '?path=/docs/datasetcontrol-customization-appearance--overview', text: 'Replace any piece a part draws, and every string it shows.' },
]

const meta = {
    title: 'DatasetControl/Get started/Overview',
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
