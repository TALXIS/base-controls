import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { ShowcaseExample } from '../../grid/examples/getStartedExamples'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `
Grid shows and edits the records of a data provider, built on <a href="https://www.ag-grid.com/" target="_blank" rel="noreferrer">AG Grid</a>. Every column gets the control for its data type, with validation and saving built in. Sorting, filtering, grouping, selection and the rest are [modules](?path=/docs/grid-modules--overview), so you include only what you need.

Below is an example of a sales pipeline. Pick a preset or open **Features** to turn features on one by one, and open **Code** to read and edit the source. *Closing deals* adds custom code to show how the grid can be extended. *Enterprise* features need an AG Grid Enterprise licence; without one, AG Grid shows a watermark.

{{canvas: Overview}}

## What you get

{{block: explore}}

## Your first grid

\`\`\`tsx
import { Grid, PcfContextProvider, createClientSideRowModelModule } from '@talxis/base-controls'
import { DataTypes, MemoryDataProvider } from '@talxis/client-libraries'

const products = new MemoryDataProvider({
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
    <Grid.Root provider={products} modules={{ rowModel: createClientSideRowModelModule() }} />
</PcfContextProvider>
\`\`\`

- \`provider\` holds the records and columns. Use any provider from \`@talxis/client-libraries\`, or your own class extending \`DataProvider\`.
- \`modules\` switch features on. Only \`rowModel\` is required. All modules are listed on [**Modules**](?path=/docs/grid-modules--overview).
- \`PcfContextProvider\` must wrap the grid. See [**PcfContextProvider**](?path=/docs/providers-pcfcontextprovider--overview).
`

const EXPLORE: IExploreCard[] = [
    { title: 'Every data type', iconName: 'Database', href: '?path=/docs/grid-get-started-data--overview', text: 'Text, numbers, money, dates, durations, option sets and lookups, each drawn and edited by its own control, plus files and images.' },
    { title: 'Inline Editing', iconName: 'Edit', href: '?path=/docs/grid-editing--overview', text: 'Edit in place, validate every value, lock what must not change, and show why a save was refused.' },
    { title: 'Modules', iconName: 'Puzzle', href: '?path=/docs/grid-modules--overview', text: 'Selection, sorting, filtering, grouping, totals, cell ranges and copying. Take only the ones you need.' },
    { title: 'Columns your way', iconName: 'TripleColumn', href: '?path=/docs/grid-columns--overview', text: 'Pin, align and compute columns, add row commands, and extend the header menus.' },
    { title: 'Your look', iconName: 'Color', href: '?path=/docs/grid-appearance--overview', text: 'Conditional formatting, option set colours, density, your own labels, and your own cells, headers and overlays.' },
    { title: 'Built to extend', iconName: 'Plug', href: '?path=/docs/grid-extending--overview', text: 'Hooks into what the grid draws and decides, modules of your own, and AG Grid underneath when you need it.' },
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
