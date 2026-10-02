import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { OpenTicketGroupsExample } from '../../../grid/examples/modulesExamples'

const DESCRIPTION = `
Selecting, sorting, filtering, grouping, totals and copying are modules: you pass the ones you want in \`modules\`, and a feature you leave out is not there at all. Every grid also needs a row model, which is a module too. This page lists every module, how to turn them on, which need AG Grid Enterprise, and how the two row models differ.

## The modules

| Key | Factory | What it adds | AG Grid Enterprise | Details |
|---|---|---|---|---|
| \`rowModel\` | \`createClientSideRowModelModule()\` or \`createServerSideRowModelModule()\` | How the grid gets its rows. **Required.** | The server-side one | *Row models*, below |
| \`rowSelection\` | \`createRowSelectionModule({ mode })\` | A checkbox column, and selecting rows by clicking them | | [**Selection and clipboard**](?path=/docs/grid-modules-selection-and-clipboard--overview) |
| \`cellSelection\` | \`createCellSelectionModule()\` | Highlighting blocks of cells by dragging across them | Yes | [**Selection and clipboard**](?path=/docs/grid-modules-selection-and-clipboard--overview) |
| \`clipboard\` | \`createClipboardModule()\` | Copying a cell, or the highlighted blocks, with Ctrl+C | Yes | [**Selection and clipboard**](?path=/docs/grid-modules-selection-and-clipboard--overview) |
| \`sorting\` | \`createSortingModule()\` | Sorting from a column's menu | | [**Sorting and filtering**](?path=/docs/grid-modules-sorting-and-filtering--overview) |
| \`filtering\` | \`createFilteringModule()\` | Filtering from a column's menu | | [**Sorting and filtering**](?path=/docs/grid-modules-sorting-and-filtering--overview) |
| \`grouping\` | \`createGroupingModule()\` | Grouping the rows by a column's values | Yes | [**Grouping and totals**](?path=/docs/grid-modules-grouping-and-totals--overview) |
| \`aggregation\` | \`createAggregationModule()\` | A totals row, and totals in group rows | | [**Grouping and totals**](?path=/docs/grid-modules-grouping-and-totals--overview) |
| \`legacyClientApiCompatibility\` | \`createLegacyClientApiCompatibilityModule()\` | What client scripts set on records: locks, colours, notifications, loading and controls | | [**Legacy client API**](?path=/docs/grid-modules-legacy-client-api--overview) |
| \`license\` | \`createLicenseModule({ key })\` | Your AG Grid Enterprise licence | | *AG Grid Enterprise and the licence*, below |
| \`custom\` | An array of \`IGridModule\` | Modules of your own | | [**Write a module**](?path=/docs/grid-extending-write-a-module--overview) |

Whether a column can be sorted, filtered, grouped or totalled is up to its metadata: see [**Data**](?path=/docs/grid-get-started-data--overview). Sorting, filtering, grouping and aggregation take \`labels\` for the text they draw, and they and row selection take \`components\` for the parts they draw; each module's page lists them.

## Turning modules on

\`\`\`tsx
<Grid.Root
    provider={provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        rowSelection: createRowSelectionModule({ mode: 'multiple' }),
        sorting: createSortingModule(),
        filtering: createFilteringModule(),
    }} />
\`\`\`

An entry set to \`undefined\` is the same as one left out.

\`modules\`, and every option you pass to a factory, are read once, when the grid mounts. A new \`modules\` object, or a changed option such as \`onSelectionChanged\`, is not picked up later. To switch a module on or off, or to change its options, give the grid a new \`key\` so that it mounts again:

\`\`\`tsx
interface IOrdersGridProps {
    provider: IDataProvider
    allowGrouping: boolean
}

const OrdersGrid = (props: IOrdersGridProps) => <Grid.Root
    key={props.allowGrouping ? 'grouped' : 'flat'}
    provider={props.provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        grouping: props.allowGrouping ? createGroupingModule() : undefined,
    }} />
\`\`\`

A new mount loses the scroll position, the focus and any save status a row is showing. What the provider holds stays: its records, sorting, filters, grouping and selection. A module you switch off leaves its state on the provider, so clear that too: when grouping goes away, remove each of \`provider.grouping.getGroupBys()\` with \`removeGroupBy(alias)\`, then call \`provider.refresh()\` (see *Preset grouping and totals* on [**Grouping and totals**](?path=/docs/grid-modules-grouping-and-totals--overview)).

As the grid mounts, the modules register in the order of the object's keys, then the \`custom\` modules in array order, so a module of your own finds every built-in module's service already there. Which module has the last word when two change the same thing is set by priorities, not by this order: see \`GRID_MODULE_PRIORITY\` on [**Extending**](?path=/docs/grid-extending--overview).

## AG Grid Enterprise and the licence

The grid runs on AG Grid Community. The modules marked in the table's *AG Grid Enterprise* column use AG Grid Enterprise, which needs a licence from AG Grid. Every AG Grid package they use comes with \`@talxis/base-controls\`; to license them, pass your key to the \`license\` module:

\`\`\`tsx
//a LicenseKey input parameter declared in your control's manifest
const licenseKey = context.parameters.LicenseKey.raw

<Grid.Root
    provider={provider}
    modules={{
        license: licenseKey ? createLicenseModule({ key: licenseKey }) : undefined,
        rowModel: createServerSideRowModelModule(),
        grouping: createGroupingModule(),
    }} />
\`\`\`

- \`key\` is required, so leave the module out while there is no key, as above. Outside a PCF control, read the key from your app's configuration, such as an environment value set at build time.
- The key is set for the whole page: once one grid has registered it, every grid on the page is licensed.
- Without a licence, a grid with an Enterprise module makes AG Grid log a licence message to the browser console and, on any host other than \`localhost\` and \`127.0.0.1\`, draw a watermark over the grid. AG Grid registers modules for the whole page, so once any grid has used an Enterprise module, every grid on the page does the same, Community-only grids included.

These docs have no licence, so once an example with an Enterprise module has run, the grids on the published docs show the watermark.

## Row models

\`rowModel\` decides how the grid gets its rows. Both models show the provider's current page (paging is on [**Data**](?path=/docs/grid-get-started-data--overview)), and without grouping they show the same rows. Once the rows are grouped, they load the groups differently:

| | \`createClientSideRowModelModule()\` | \`createServerSideRowModelModule()\` |
|---|---|---|
| AG Grid | Community | Enterprise |
| A group's records | Fetched for every group, at every level, as soon as the provider loads | Fetched when the group opens |
| Opening a group | Instant, once the groups have arrived | Shows a loading row until the group's records arrive |
| Requests to your data source | One per group, all at once, after every load: sorting, filtering or refreshing fetches every group again | One per group the user opens; after a reload, one per group still open |

Use the client side by default. Use the server side when people group by a column with many values, or into big groups, so that only the groups they open are fetched. Grouping itself is on [**Grouping and totals**](?path=/docs/grid-modules-grouping-and-totals--overview).

{{story: Open ticket groups on demand}}
`

const meta = {
    title: 'Grid/Modules',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const OpenTicketGroupsOnDemand: Story = {
    name: 'Open ticket groups on demand',
    render: () => renderStory(<OpenTicketGroupsExample />),
    parameters: {
        docs: {
            description: {
                story: `A support lead works the queue grouped by customer, against a service where every request takes a moment: \`createClientSideRowModelModule()\` fetches every customer's tickets as soon as the list loads, and \`createServerSideRowModelModule()\` fetches a customer's tickets when you open it. Pick a row model above the grid, open a few customers and watch the count of customers fetched.`,
            },
        },
    },
}
