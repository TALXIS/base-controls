import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { ShowcaseExample } from '../../grid/examples/getStartedExamples'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `
Grid shows the records of a data provider, on top of <a href="https://www.ag-grid.com/" target="_blank" rel="noreferrer">AG Grid</a>. Every column draws and edits its values with the control for its data type, and everything beyond that is a module you switch on:

- [**Editing**](?path=/docs/grid-modules-editing--overview): change values in place, check them as they are typed, save them, and lock what must not change.
- [**Selection and clipboard**](?path=/docs/grid-modules-selection-and-clipboard--overview): select rows, highlight blocks of cells and copy them into a spreadsheet.
- [**Sorting and filtering**](?path=/docs/grid-modules-sorting-and-filtering--overview): straight from each column's menu.
- [**Grouping and totals**](?path=/docs/grid-modules-grouping-and-totals--overview): group the rows by a column, and total its values.

Below is a sales pipeline. Pick a preset or open **Features & Modules** to switch modules one by one, and open **Code** to read and edit the source. *Enterprise* features need an AG Grid Enterprise licence; without one, AG Grid draws a watermark.

{{canvas: Overview}}

## Your first grid

\`\`\`tsx
import { DatasetControl, Grid, PcfContextProvider, createClientSideRowModelModule } from '@talxis/base-controls'
import { DataTypes, MemoryDataProvider } from '@talxis/client-libraries'

const createProducts = () => new MemoryDataProvider({
    dataSource: [
        { productid: 'desk', name: 'Standing desk', price: 640 },
        { productid: 'chair', name: 'Ergonomic chair', price: 410 },
    ],
    metadata: { PrimaryIdAttribute: 'productid', PrimaryNameAttribute: 'name', LogicalName: 'product' },
    columns: [
        { name: 'name', displayName: 'Product', dataType: DataTypes.SingleLineText },
        { name: 'price', displayName: 'Price', dataType: DataTypes.Currency },
    ],
})

export const ProductGrid = () => <PcfContextProvider>
    <DatasetControl onLoad={async () => ({ provider: createProducts() })}>
        <DatasetControl.Body>
            <Grid modules={{ rowModel: createClientSideRowModelModule() }} />
        </DatasetControl.Body>
    </DatasetControl>
</PcfContextProvider>
\`\`\`

- **The grid takes no provider prop.** It shows the provider around it: the one a [**DatasetControl**](?path=/docs/datasetcontrol-get-started--overview) loads, which is the recommended way, as it also brings the header, paging, views, loading and error states. For a grid on its own, wrap it in a [**DataProviderContextProvider**](?path=/docs/providers-dataprovidercontextprovider--overview) and load the provider yourself with \`refresh()\`. Without either, the grid throws.
- **\`modules\` switches features on.** Only \`rowModel\` is required.
- **\`PcfContextProvider\`** must wrap the grid. See [**PcfContextProvider**](?path=/docs/providers-pcfcontextprovider--overview).

## How it fits together

1. **The provider holds the data.** Its columns become the grid's columns, and the records of its current page become the rows. See [**Data**](?path=/docs/grid-data--overview).
2. **\`colDefs\` shapes the columns**: pin them, link them, add calculated ones, give them commands. See [**Columns**](?path=/docs/grid-columns--overview).
3. **Modules add the features**, each with its own options, look and service. See [**Modules**](?path=/docs/grid-modules--overview).
4. **Your code talks to the grid** through \`IGrid\`, which \`onReady\` passes you: \`grid.services.find('sorting')?.sortColumn('price')\`. See [**Talking to the grid**](?path=/docs/grid-talking-to-the-grid--overview).
5. **Everything it draws can be restyled or replaced**, from a cell's colour to the whole cell. See [**Appearance**](?path=/docs/grid-appearance--overview).

Every prop and event of \`<Grid />\` is on [**Props and events**](?path=/docs/grid-props-and-events--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Every data type', iconName: 'Database', href: '?path=/docs/grid-data--overview', text: 'Text, numbers, money, dates, durations, option sets and lookups, each drawn and edited by its own control, plus files and images.' },
    { title: 'Inline Editing', iconName: 'Edit', href: '?path=/docs/grid-modules-editing--overview', text: 'Edit in place, validate every value, lock what must not change, and show why a save was refused.' },
    { title: 'Modules', iconName: 'Puzzle', href: '?path=/docs/grid-modules--overview', text: 'Selection, sorting, filtering, grouping, totals, cell ranges and copying. Take only the ones you need.' },
    { title: 'Columns your way', iconName: 'TripleColumn', href: '?path=/docs/grid-columns--overview', text: 'Pin, align and compute columns, add cell commands, and extend the header menus.' },
    { title: 'Your look', iconName: 'Color', href: '?path=/docs/grid-appearance--overview', text: 'Conditional formatting, option set colours, density, your own labels, and your own cells, headers and overlays.' },
    { title: 'Built to extend', iconName: 'Plug', href: '?path=/docs/grid-extending-write-a-module--overview', text: 'Talk to the grid from your code, hook into what it draws and decides, write modules of your own, and reach AG Grid underneath.' },
]

const meta = {
    title: 'Grid/Get started',
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
