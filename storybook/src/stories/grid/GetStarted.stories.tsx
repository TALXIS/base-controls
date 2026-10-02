import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { ShowcaseExample } from '../../grid/examples/getStartedExamples'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `
Grid shows the records of a data provider and lets people work with them. Each value is drawn and edited the way its data type calls for, with this library's own controls. Edits are validated and saved, and everything else (selection, sorting, filtering, grouping, totals, copying) is a module you switch on. It runs on <a href="https://www.ag-grid.com/" target="_blank" rel="noreferrer">AG Grid</a>, which draws only the rows in view.

Below is a sales pipeline. Start from a preset, or switch features on and off one by one: it is the same component in every combination. **Code** shows what renders it, and you can edit it; the totals, the grouping by Stage and a server that refuses deals over $30,000 are set up on the provider it is handed. Features marked *Enterprise* need an AG Grid Enterprise licence. These docs have none, so once you switch one on, AG Grid may draw its watermark over the grids on these pages.

{{canvas: Overview}}

## What you get

{{block: explore}}

## Your first grid

\`\`\`tsx
import { useMemo } from 'react'
import { Grid, PcfContextProvider, createClientSideRowModelModule, createSortingModule } from '@talxis/base-controls'
import { DataTypes, MemoryDataProvider } from '@talxis/client-libraries'

const createProvider = () => {
    const provider = new MemoryDataProvider({
        dataSource: [
            { productid: 'desk', name: 'Standing desk', price: 640 },
            { productid: 'chair', name: 'Ergonomic chair', price: 410 },
        ],
        metadata: { PrimaryIdAttribute: 'productid', PrimaryNameAttribute: 'name', LogicalName: 'product' },
    })
    provider.setColumns([
        { name: 'name', displayName: 'Product', dataType: DataTypes.SingleLineText, metadata: { IsValidForGrid: true } },
        { name: 'price', displayName: 'Price', dataType: DataTypes.Currency, metadata: { IsValidForGrid: true } },
    ])
    provider.refresh()
    return provider
}

export const ProductGrid = () => {
    const provider = useMemo(createProvider, [])
    return <PcfContextProvider>
        <Grid.Root
            provider={provider}
            modules={{
                rowModel: createClientSideRowModelModule(),
                sorting: createSortingModule(),
            }} />
    </PcfContextProvider>
}
\`\`\`

- \`provider\` holds the records and describes the columns. Any data provider from \`@talxis/client-libraries\` works. The grid does not load it: call \`refresh()\` yourself. What the grid reads from it is on [**Data**](?path=/docs/grid-get-started-data--overview).
- \`modules\` lists the features the grid has. \`rowModel\` is the only one every grid needs; the rest are on [**Modules**](?path=/docs/grid-modules--overview).
- \`PcfContextProvider\` is required: the grid reads the PCF context from it. Inside a PCF control, pass it your control's \`context\`; without one it builds a sample context.

Before the first grid renders, also:

- call \`initializeIcons()\` from \`@fluentui/react\` once, since the grid draws Fluent icons and registers none;
- let your bundler handle CSS imports from \`node_modules\`, since the grid imports AG Grid's stylesheets;
- wrap the grid in a \`ThemeProvider\` for your own colours, or it uses Fluent's default theme. See [**Appearance**](?path=/docs/grid-appearance--overview).

Every prop and event of \`<Grid.Root />\` is listed on [**Props and events**](?path=/docs/grid-get-started-props-and-events--overview).
`

const EXPLORE: IExploreCard[] = [
    { title: 'Every data type', iconName: 'Database', href: '?path=/docs/grid-get-started-data--overview', text: 'Text, numbers, money, dates, durations, option sets and lookups, each drawn and edited by its own control, plus files and images.' },
    { title: 'Editing that saves', iconName: 'Edit', href: '?path=/docs/grid-editing--overview', text: 'Edit in place, validate every value, lock what must not change, and show why a save was refused.' },
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
