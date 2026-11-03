import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { ShowcaseExample } from '../../grid/examples/getStartedExamples'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `
Grid shows the records of a data provider, on top of <a href="https://www.ag-grid.com/" target="_blank" rel="noreferrer">AG Grid</a>. Every column draws its values with the control for its data type, and everything beyond that is a module you switch on:

| Module | Adds |
|---|---|
| [**Editing**](?path=/docs/controls-grid-modules-editing--overview) | Change values in place, check them as they are typed, save them, and lock what must not change. |
| [**Selection and clipboard**](?path=/docs/controls-grid-modules-selection-and-clipboard--overview) | Select rows, highlight blocks of cells and copy them into a spreadsheet. |
| [**Sorting and filtering**](?path=/docs/controls-grid-modules-sorting-and-filtering--overview) | Straight from each column's menu. |
| [**Grouping and totals**](?path=/docs/controls-grid-modules-grouping-and-totals--overview) | Group the rows by a column, and total its values. |

Below is a sales pipeline. Pick a preset or open **Features & Modules** to switch modules one by one, and open **Code** to read and edit the source. *Enterprise* features need an AG Grid Enterprise licence; without one, AG Grid draws a watermark.

{{canvas: Overview}}

## Basic usage

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
            <Grid modules={[createClientSideRowModelModule()]} />
        </DatasetControl.Body>
    </DatasetControl>
</PcfContextProvider>
\`\`\`

The grid takes no provider prop. It shows the provider around it: the one a [**DatasetControl**](?path=/docs/controls-datasetcontrol-get-started--overview) loads, which also brings the header, paging, views, loading and error states. For a grid on its own, wrap it in a \`DataProviderScope\` and load the provider yourself with \`refresh()\`. Without either, the grid throws.

\`modules\` switches features on, and only a row model is required. A [**PCF context**](?path=/docs/concepts-pcf-context--overview) must wrap the grid.

## How it fits together

| Part | What it does | Page |
|---|---|---|
| The provider | Holds the data: its columns become the grid's columns, and the records of its current page the rows. | [**Data**](?path=/docs/controls-grid-data--overview) |
| \`colDefs\` | Shapes the columns: pin them, link them, add calculated ones, give them commands. | [**Columns**](?path=/docs/controls-grid-columns--overview) |
| \`modules\` | Add the features, each with its own options, look and instance. | [**Modules**](?path=/docs/controls-grid-modules--overview) |
| \`IGrid\` | What your code talks to, passed by \`onReady\`: \`grid.modules.find('sorting')?.sortColumn('price')\`. | [**Talking to the grid**](?path=/docs/controls-grid-talking-to-the-grid--overview) |
| Appearance | Restyle or replace what the grid draws, from a cell's colour to the whole cell. | [**Appearance**](?path=/docs/controls-grid-appearance--overview) |
| Labels | Translate every string through a \`LabelsProvider\`. | [**Localization**](?path=/docs/concepts-localization--overview) |

Every prop and event of \`<Grid />\` is on [**Props and events**](?path=/docs/controls-grid-props-and-events--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Every data type', iconName: 'Database', href: '?path=/docs/controls-grid-data--overview', text: 'Text, numbers, money, dates, durations, option sets and lookups, each drawn and edited by its own control, plus files and images.' },
    { title: 'Inline Editing', iconName: 'Edit', href: '?path=/docs/controls-grid-modules-editing--overview', text: 'Edit in place, validate every value, lock what must not change, and show why a save was refused.' },
    { title: 'Modules', iconName: 'Puzzle', href: '?path=/docs/controls-grid-modules--overview', text: 'Selection, sorting, filtering, grouping, totals, cell ranges and copying. Take only the ones you need.' },
    { title: 'Columns your way', iconName: 'TripleColumn', href: '?path=/docs/controls-grid-columns--overview', text: 'Pin, align and compute columns, add cell commands, and extend the header menus.' },
    { title: 'Your look', iconName: 'Color', href: '?path=/docs/controls-grid-appearance--overview', text: 'Conditional formatting, option set colours, density, and your own cells, headers and overlays.' },
    { title: 'Built to extend', iconName: 'Plug', href: '?path=/docs/controls-grid-extending-write-a-module--overview', text: 'Talk to the grid from your code, hook into what it draws and decides, write modules of your own, and reach AG Grid underneath.' },
]

const meta = {
    title: 'Controls/Grid/Get started',
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
