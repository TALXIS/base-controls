import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ShowcaseExample } from '../../dataset-control/examples/getStartedExamples'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `
DatasetControl is the frame around a list of records: it loads them, shows a placeholder while they load and an error when that fails, and holds the parts around them, such as views, a ribbon, quick find, column editing, paging and notifications. What shows the records themselves is up to you, usually a [**Grid**](?path=/docs/controls-grid-get-started--overview).

Below is a sales pipeline. Try: switch the view, search, sort, and select deals to change the ribbon. Open **Code** to read and edit the source.

{{canvas: Overview}}

## Basic usage

A *provider* holds the records and everything about them: their columns, sorting, paging and selection. Creating one is on [**Data providers**](?path=/docs/concepts-data-providers--overview).

\`\`\`tsx
import { createClientSideRowModelModule, DatasetControl, Grid, IDatasetControlLoadParameters, IDatasetControlLoadResult, IDatasetControlView, PcfContextProvider } from '@talxis/base-controls'

const loadViews = async (): Promise<IDatasetControlView[]> => [
    { id: 'all', name: 'All deals', resolve: () => ({ columns: DEAL_COLUMNS }) },
    { id: 'won', name: 'Won deals', resolve: () => ({ columns: DEAL_COLUMNS, data: { stage: 'won' } }) },
]

const loadDeals = async ({ view }: IDatasetControlLoadParameters): Promise<IDatasetControlLoadResult> => {
    const provider = await createDealsProvider()
    const resolved = view && await view.resolve(provider)
    applyDealView(provider, resolved?.data)
    return { provider }
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
            <Grid stateKey='grid' modules={[createClientSideRowModelModule()]} />
        </DatasetControl.Body>
        <DatasetControl.Footer>
            <DatasetControl.Footer.End>
                <DatasetControl.Pagination />
            </DatasetControl.Footer.End>
        </DatasetControl.Footer>
    </DatasetControl>
</PcfContextProvider>
\`\`\`

You should see a placeholder while the deals load, then the grid with *All deals* in the view switcher, a search box and the page buttons. \`PcfContextProvider\` must wrap the control (see [**PCF context**](?path=/docs/concepts-pcf-context--overview)).

## How it fits together

The control's \`onLoad\` returns a provider for the view the user is on, and every part inside the control works on that provider. \`Grid\` takes no provider of its own: it uses the control's. Each load, whether the first one, a view switch or a reload, mounts the parts anew on a new provider.

| To | Use | See |
|---|---|---|
| Load the records of a view | \`onLoad\`, and \`onLoadDependencies\` for what every load needs first | [**Loading data**](?path=/docs/controls-datasetcontrol-loading-data--overview) |
| List views to switch between | \`onLoadViews\` and \`DatasetControl.ViewSwitcher\` | [**Views**](?path=/docs/controls-datasetcontrol-views--overview) |
| Place the parts | \`Header\`, \`Body\` and \`Footer\`, each with a start and an end | [**Layout**](?path=/docs/controls-datasetcontrol-layout--overview) |
| Show a failure | Throw. The control shows it, with *Try again* where it can. | [**Error handling**](?path=/docs/controls-datasetcontrol-error-handling--overview) |
| Drive the control from your code | \`useDatasetControl()\` inside it, \`onMounted\` outside | [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview) |
| Bring the user back where they left off | \`stateKey\` | [**State**](?path=/docs/controls-datasetcontrol-state--overview) |
| Change what a part draws, or translate it | \`components\`, \`LabelsProvider\` | [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview), [**Localization**](?path=/docs/concepts-localization--overview) |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| \`onLoad\` | \`(params) => Promise<IDatasetControlLoadResult>\` | Required | Returns the provider for a view. See [**Loading data**](?path=/docs/controls-datasetcontrol-loading-data--overview). |
| \`onLoadViews\` | \`() => Promise<IDatasetControlView<TData>[]>\` | None | Returns the views to switch between, on every load. \`TData\` is the type of every view's \`data\`. See [**Views**](?path=/docs/controls-datasetcontrol-views--overview). |
| \`onLoadDependencies\` | \`() => Promise<unknown>\` | None | Loads what the modules and \`onLoad\` need, first on every load. They read it with \`getDependencies()\`. |
| \`modules\` | \`IDatasetControlModule[]\` | None | Features added to the control, such as the user's own views. Read on every load. See *Modules* on [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview). |
| \`children\` | \`ReactNode\` | Required | The regions and the parts. See [**Layout**](?path=/docs/controls-datasetcontrol-layout--overview). |
| \`height\` | \`string\` | None | See *Size the control* on [**Layout**](?path=/docs/controls-datasetcontrol-layout--overview). |
| \`className\` | \`string\` | None | Added to the control's box. |
| \`stateKey\` | \`string\` | None | Keeps where the user left off in the state store, for the next mount. Read once. See [**State**](?path=/docs/controls-datasetcontrol-state--overview). |
| \`destroyProviderOnUnmount\` | \`boolean\` | \`true\` | Whether the control destroys the providers it lets go of. See *Keep a shared provider* on [**Loading data**](?path=/docs/controls-datasetcontrol-loading-data--overview). |
| \`components\` | \`IDatasetControlComponents\` | Defaults | The control's box, placeholder, error and loading overlay. See [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview). |
| \`scope\` | \`ComponentType<{ children: ReactNode }>\` | None | Wraps everything inside the control, such as in a context provider of yours. Pass the same component on every render. |
| \`onMounted\`, \`onReady\`, \`onDestroyed\` | \`(control: IDatasetControl<TData>) => void\` | None | Pass you the control before each load, once it succeeded, and as it goes. See [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview). |

To change the control's strings, see [**Localization**](?path=/docs/concepts-localization--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Loading data', iconName: 'CloudDownload', href: '?path=/docs/controls-datasetcontrol-loading-data--overview', text: 'Load each view in your own onLoad, behind a placeholder, with a failed load shown and retried for you.' },
    { title: 'Error handling', iconName: 'Error', href: '?path=/docs/controls-datasetcontrol-error-handling--overview', text: 'Throw from a load or a command, and the user sees the error with a way to try again.' },
    { title: 'Talking to the control', iconName: 'Plug', href: '?path=/docs/controls-datasetcontrol-talking-to-the-control--overview', text: 'Switch views, reload, follow every load and reach any part from your own code.' },
    { title: 'Views', iconName: 'ViewList', href: '?path=/docs/controls-datasetcontrol-views--overview', text: 'Many views of the same records, each loading its own provider set-up or drawn with a UI of its own.' },
    { title: 'Every part', iconName: 'Puzzle', href: '?path=/docs/controls-datasetcontrol-parts-ribbon--overview', text: 'A ribbon that follows the selection, quick find, column editing, paging and notifications.' },
    { title: 'Layout that adapts', iconName: 'ResponsiveDesign', href: '?path=/docs/controls-datasetcontrol-layout--overview', text: 'Left and right regions, a height that fills any space, and a header that gives way on a narrow screen.' },
    { title: 'Back where they left off', iconName: 'History', href: '?path=/docs/controls-datasetcontrol-state--overview', text: 'Every view keeps its sorting, search, paging and scroll, and the control reopens on the view the user was on.' },
    { title: 'Your own UI', iconName: 'GridViewSmall', href: '?path=/docs/controls-datasetcontrol-your-own-ui--overview', text: 'Replace any piece a part draws, add parts of your own, and show the records as a list, cards or a chart.' },
    { title: 'Your language', iconName: 'Color', href: '?path=/docs/concepts-localization--overview', text: 'Translate or reword every string the control and its parts show.' },
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
