import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ShowcaseExample } from '../../dataset-control/examples/getStartedExamples'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `
DatasetControl is the frame around a list of records: it loads them, shows a placeholder while they load and an error when that fails, and holds the parts around them, such as views, a ribbon, quick find, column editing, paging and notifications. What shows the records themselves is up to you, usually a [**Grid**](?path=/docs/grid-get-started--overview).

Below is a sales pipeline. Try: switch the view, search, sort, and select deals to change the ribbon. Open **Code** to read and edit the source.

{{canvas: Overview}}

## Your first DatasetControl

A *provider* holds the records and everything about them: their columns, sorting, paging and selection. Creating one is on [**Data providers**](?path=/docs/data-providers--overview).

\`\`\`tsx
import { createClientSideRowModelModule, DatasetControl, Grid, IDatasetControlLoadParameters, IDatasetControlLoadResult, IDatasetControlView, PcfContextProvider } from '@talxis/base-controls'

const loadViews = async (): Promise<IDatasetControlView[]> => [
    { id: 'all', name: 'All deals' },
    { id: 'won', name: 'Won deals', data: { stage: 'won' } },
]

const loadDeals = async (params: IDatasetControlLoadParameters): Promise<IDatasetControlLoadResult> => {
    return { provider: await createDealsProvider(params.view?.data) }
}

export const Deals = () => <PcfContextProvider>
    <DatasetControl onLoadViews={loadViews} stateKey='deals' onLoad={loadDeals} height='600px'>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.ViewSwitcher />
            </DatasetControl.Header.Start>
            <DatasetControl.Header.End>
                <DatasetControl.QuickFind />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <Grid stateKey='grid' modules={{ rowModel: createClientSideRowModelModule() }} />
        </DatasetControl.Body>
        <DatasetControl.Footer>
            <DatasetControl.Footer.End>
                <DatasetControl.Pagination />
            </DatasetControl.Footer.End>
        </DatasetControl.Footer>
    </DatasetControl>
</PcfContextProvider>
\`\`\`

You should see a placeholder while the deals load, then the grid with *All deals* in the view switcher, a search box and the page buttons.

## How it fits together

1. **The control's \`onLoad\` returns a provider for the view the user is on.** The control calls it at mount and on every view switch, and shows a placeholder until the provider's first page is in. See [**Loading data**](?path=/docs/datasetcontrol-loading-data--overview).
2. **The parts work on that provider.** Place them in the header, body and footer regions and leave out the ones you don't need. \`Grid\` takes no provider of its own: it uses the control's. See [**Layout**](?path=/docs/datasetcontrol-layout--overview).
3. **The views come from the control's \`onLoadViews\`,** each carrying what \`onLoad\` needs to load it, and the ribbon's commands from the ribbon's own \`onLoad\`. See [**Views**](?path=/docs/datasetcontrol-views--overview) and [**Ribbon**](?path=/docs/datasetcontrol-parts-ribbon--overview).
4. **Throw when something fails.** The control shows the error to the user, with *Try again* where it can. See [**Error handling**](?path=/docs/datasetcontrol-error-handling--overview).
5. **Your code talks to the control** through \`useDatasetControl()\` inside it, or \`onReady\` outside: switch views, reload, follow every load, and reach any part, such as \`control.parts.get('quickFind').search()\`. See [**Talking to the control**](?path=/docs/datasetcontrol-talking-to-the-control--overview).

\`PcfContextProvider\` must wrap the control. See [**PcfContextProvider**](?path=/docs/providers-pcfcontextprovider--overview).

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| \`onLoad\` | \`(params) => Promise<IDatasetControlLoadResult>\` | Required | Returns the provider for a view. See [**Loading data**](?path=/docs/datasetcontrol-loading-data--overview). |
| \`onLoadViews\` | \`() => Promise<IDatasetControlView<TData>[]>\` | None | Returns the views to switch between, before every \`onLoad\`. \`TData\` is the type of every view's \`data\`. See [**Views**](?path=/docs/datasetcontrol-views--overview). |
| \`modules\` | \`IDatasetControlModules\` | None | Features added to the control, such as \`userQueries\` for the user's own views. Read on every load. See *Let users save their own views* on [**Views**](?path=/docs/datasetcontrol-views--overview). |
| \`children\` | \`ReactNode\` | Required | The regions and the parts. See [**Layout**](?path=/docs/datasetcontrol-layout--overview). |
| \`height\` | \`string\` | None | The control's height. See *Size the control* on [**Layout**](?path=/docs/datasetcontrol-layout--overview). |
| \`className\` | \`string\` | None | Added to the control's box. |
| \`stateKey\` | \`string\` | None | Brings the user back where they left off on the next mount. Read at mount. See [**State**](?path=/docs/datasetcontrol-state--overview). |
| \`destroyProviderOnUnmount\` | \`boolean\` | \`true\` | Whether the control destroys the providers it lets go of. See *Keep a shared provider* on [**Loading data**](?path=/docs/datasetcontrol-loading-data--overview). |
| \`labels\` | \`Partial<IDatasetControlLabels>\` | English | The control's own strings. Read at mount. See [**Localization**](?path=/docs/datasetcontrol-localization--overview). |
| \`components\` | \`IDatasetControlComponents\` | Defaults | See *Replace pieces of the parts* on [**Your own UI**](?path=/docs/datasetcontrol-your-own-ui--overview). |
| \`scope\` | \`ComponentType<{ children: ReactNode }>\` | None | Wraps everything inside the control, such as in a context provider of yours. Pass the same component on every render. |
| \`onReady\` | \`(control: IDatasetControl) => void\` | None | Passes you the control once it exists, before the first load. See [**Talking to the control**](?path=/docs/datasetcontrol-talking-to-the-control--overview). |
| \`onDestroyed\` | \`(control: IDatasetControl) => void\` | None | Passes you the control as it unmounts, while its provider still holds its data. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Loading data', iconName: 'CloudDownload', href: '?path=/docs/datasetcontrol-loading-data--overview', text: 'Load each view in your own onLoad, behind a placeholder, with a failed load shown and retried for you.' },
    { title: 'Error handling', iconName: 'Error', href: '?path=/docs/datasetcontrol-error-handling--overview', text: 'Throw from a load or a command, and the user sees the error with a way to try again.' },
    { title: 'Talking to the control', iconName: 'Plug', href: '?path=/docs/datasetcontrol-talking-to-the-control--overview', text: 'Switch views, reload, follow every load and reach any part from your own code.' },
    { title: 'Views', iconName: 'ViewList', href: '?path=/docs/datasetcontrol-views--overview', text: 'Many views of the same records, each loading its own provider set-up or drawn with a UI of its own.' },
    { title: 'Every part', iconName: 'Puzzle', href: '?path=/docs/datasetcontrol-parts-ribbon--overview', text: 'A ribbon that follows the selection, quick find, column editing, paging and notifications.' },
    { title: 'Layout that adapts', iconName: 'ResponsiveDesign', href: '?path=/docs/datasetcontrol-layout--overview', text: 'Left and right regions, a height that fills any space, and a header that gives way on a narrow screen.' },
    { title: 'Back where they left off', iconName: 'History', href: '?path=/docs/datasetcontrol-state--overview', text: 'Every view keeps its sorting, search, paging and scroll, and the control reopens on the view the user was on.' },
    { title: 'Your own UI', iconName: 'GridViewSmall', href: '?path=/docs/datasetcontrol-your-own-ui--overview', text: 'Replace any piece a part draws, add parts of your own, and show the records as a list, cards or a chart.' },
    { title: 'Your language', iconName: 'Color', href: '?path=/docs/datasetcontrol-localization--overview', text: 'Translate every string the control and its parts show.' },
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
