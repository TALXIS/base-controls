import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { OpenTicketGroupsExample } from '../../../grid/examples/modulesExamples'

const DESCRIPTION = `
Editing, selecting, sorting, filtering, grouping, totals and copying are modules. You pass the ones you want in \`modules\`, and a feature you leave out is not there at all. Every grid also needs exactly one row model, which is a module too.

\`\`\`tsx
<DatasetControl onLoad={loadOrders}>
    <DatasetControl.Body>
        <Grid
            modules={[
                createClientSideRowModelModule(),
                createRowSelectionModule({ mode: 'multiple' }),
                createSortingModule(),
                createFilteringModule(),
            ]} />
    </DatasetControl.Body>
</DatasetControl>
\`\`\`

\`modules\` and every option you pass to a factory are read once, at mount: see *Change a prop that is read at mount* on [**Props and events**](?path=/docs/controls-grid-props-and-events--overview). A module's events come in through its options, such as \`createRowSelectionModule({ onSelectionChanged })\`.

## The modules

| Name | Factory | What it adds | Page |
|---|---|---|---|
| \`rowModel\` | \`createClientSideRowModelModule()\`, \`createServerSideRowModelModule()\` | How the grid gets its rows. Required; the server side needs AG Grid Enterprise. | *Row models* below |
| \`editing\` | \`createEditingModule()\` | Editing in place, a save status per row, locks and saving | [**Editing**](?path=/docs/controls-grid-modules-editing--overview) |
| \`rowSelection\` | \`createRowSelectionModule({ mode })\` | A checkbox column, and selecting rows by clicking them | [**Selection and clipboard**](?path=/docs/controls-grid-modules-selection-and-clipboard--overview) |
| \`cellSelection\` | \`createCellSelectionModule()\` | Highlighting blocks of cells. AG Grid Enterprise. | [**Selection and clipboard**](?path=/docs/controls-grid-modules-selection-and-clipboard--overview) |
| \`clipboard\` | \`createClipboardModule()\` | Copying and pasting cells. AG Grid Enterprise. | [**Selection and clipboard**](?path=/docs/controls-grid-modules-selection-and-clipboard--overview) |
| \`sorting\` | \`createSortingModule()\` | Sorting from a column's menu | [**Sorting and filtering**](?path=/docs/controls-grid-modules-sorting-and-filtering--overview) |
| \`filtering\` | \`createFilteringModule()\` | Filtering from a column's menu | [**Sorting and filtering**](?path=/docs/controls-grid-modules-sorting-and-filtering--overview) |
| \`grouping\` | \`createGroupingModule()\` | Grouping the rows by a column's values. AG Grid Enterprise. | [**Grouping and totals**](?path=/docs/controls-grid-modules-grouping-and-totals--overview) |
| \`aggregation\` | \`createAggregationModule()\` | A totals row, and totals in group rows | [**Grouping and totals**](?path=/docs/controls-grid-modules-grouping-and-totals--overview) |
| \`legacyClientApiCompatibility\` | \`createLegacyClientApiCompatibilityModule()\` | What client scripts set on records: locks, colours, notifications, loading and controls | [**Legacy client API**](?path=/docs/controls-grid-modules-legacy-client-api--overview) |
| \`license\` | \`createLicenseModule({ key })\` | Your AG Grid Enterprise licence | *AG Grid Enterprise and the licence* below |
| Your own | an \`IGridModule\` | Anything else | [**Write a module**](?path=/docs/controls-grid-extending-write-a-module--overview) |

Which columns offer a feature comes from the provider's columns: \`disableSorting\`, and the metadata keys \`SupportedFilterConditionOperators\`, \`CanBeGrouped\` and \`SupportedAggregations\` (see [**Data**](?path=/docs/controls-grid-data--overview)). Once loaded, a module is reached as \`grid.modules.find(name)\`, or with \`useGridModule(name)\` inside what the grid draws; each module's page lists its members under *From your code*.

## Text and looks

Modules take no text of their own: to change it, see [**Localization**](?path=/docs/concepts-localization--overview).

Sorting, filtering, grouping and aggregation take a \`components\` option for what they draw. The editing and row selection modules draw columns of their own, which you restyle through \`colDefs\` with the cells they export. Every entry point is mapped on [**Appearance**](?path=/docs/controls-grid-appearance--overview).

## Switch a module on or off

To switch a module on or off, or to change its options, give the grid a new \`key\`:

\`\`\`tsx
interface IOrdersGridProps {
    allowGrouping: boolean
}

const OrdersGrid = (props: IOrdersGridProps) => <DatasetControl onLoad={loadOrders}>
    <DatasetControl.Body>
        <Grid
            key={props.allowGrouping ? 'grouped' : 'flat'}
            modules={[
                createClientSideRowModelModule(),
                ...(props.allowGrouping ? [createGroupingModule()] : []),
            ]} />
    </DatasetControl.Body>
</DatasetControl>
\`\`\`

What the provider holds survives the remount: its records, sorting, filters, grouping and selection. A module you switch off leaves its state on the provider, so clear that too. When grouping goes away, remove each of \`provider.grouping.getGroupBys()\` with \`removeGroupBy(alias)\` and call \`provider.refresh()\`; see *Groups and totals* on [**Data providers**](?path=/docs/concepts-data-providers--overview).

## AG Grid Enterprise and the licence

The grid runs on AG Grid Community. Server-side rows, cell selection, the clipboard and grouping use AG Grid Enterprise, which needs a licence from AG Grid. The packages come with \`@talxis/base-controls\`; to license them, pass your key to the \`license\` module:

\`\`\`tsx
//a LicenseKey input parameter declared in your control's manifest
const licenseKey = context.parameters.LicenseKey.raw

<DatasetControl onLoad={loadTickets}>
    <DatasetControl.Body>
        <Grid
            modules={[
                ...(licenseKey ? [createLicenseModule({ key: licenseKey })] : []),
                createServerSideRowModelModule(),
                createGroupingModule(),
            ]} />
    </DatasetControl.Body>
</DatasetControl>
\`\`\`

\`key\` is required, so leave the module out while there is no key. The key holds for the whole page: once one grid registers it, every grid on the page is licensed. Without one, AG Grid logs a licence message to the console and, on any host but \`localhost\` and \`127.0.0.1\`, draws a watermark over every grid on the page.

## Row models

The row model decides how the grid gets its rows. Both show the provider's current page (see *Paging* on [**Data**](?path=/docs/controls-grid-data--overview)), and without grouping they show the same rows. They differ once the rows are grouped:

| Row model | A group's records | Opening a group | Requests to your data source |
|---|---|---|---|
| \`createClientSideRowModelModule()\` | Fetched for every group, at every level, as soon as the provider loads | Instant, once the groups have arrived | One per group, all at once, after every load |
| \`createServerSideRowModelModule()\` | Fetched when the group opens | Shows a loading row until the records arrive | One per group the user opens; after a reload, one per group still open |

Use the client side by default, and the server side when users group by a column with many values or into big groups.

{{story: Open ticket groups on demand}}
`

const meta = {
    title: 'Controls/Grid/Modules',
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
                story: `A support queue grouped by customer, against a slow service: the client-side row model fetches every customer's tickets as the list loads, the server-side one when you open a customer. Try: pick a row model, open a few customers and watch the count of fetches (AG Grid Enterprise).`,
            },
        },
    },
}
