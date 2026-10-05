import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { FillContainerExample, InvoiceLinesExample, TicketPreviewPaneExample, WatchEveryEventExample } from '../../../grid/examples/propsAndEventsExamples'

const DESCRIPTION = `
Everything \`<Grid.Root />\` takes: its props, how it sizes itself, and the events it fires.

## Props

| Prop | Type | Default | Read | What it does |
|---|---|---|---|---|
| \`provider\` | \`IDataProvider\` | Required | At mount | The records, the columns and the paging. See [**Data**](?path=/docs/grid-get-started-data--overview). |
| \`modules\` | \`IGridModules\` | Required | At mount | The features the grid has. \`rowModel\` is the one every grid needs. See [**Modules**](?path=/docs/grid-modules--overview). |
| \`enableEditing\` | \`boolean\` | \`false\` | At mount | Lets the user edit every column but those whose \`metadata.IsValidForUpdate\` is \`false\`. See [**Editing**](?path=/docs/grid-editing--overview). |
| \`enableAutoSave\` | \`boolean\` | \`false\` | Live | Saves a record each time one of its cells takes a value from the user. See [**Editing**](?path=/docs/grid-editing--overview). |
| \`enableNavigation\` | \`boolean\` | \`true\` | At mount | Draws emails, phones, URLs, lookups and the primary column as links, and opens a record on a double-click while editing is off. See *Data types* on [**Data**](?path=/docs/grid-get-started-data--overview). |
| \`enableOptionSetColors\` | \`boolean\` | \`false\` | At mount | Draws options that have a colour as tags. See [**Appearance**](?path=/docs/grid-appearance--overview). |
| \`enableZebra\` | \`boolean\` | \`true\` | At mount | Shades every other row. See [**Appearance**](?path=/docs/grid-appearance--overview). |
| \`rowHeight\` | \`number\` | \`42\` | At mount | How tall a row is, in pixels. See [**Appearance**](?path=/docs/grid-appearance--overview). |
| \`maxVisibleRows\` | \`number\` | \`15\` | Live | How many rows the grid grows to before it scrolls, while \`height\` is not set. See *Sizing* below. |
| \`height\` | \`string\` | None: the grid grows with its rows | Live | How tall the grid is, as a CSS length. See *Sizing* below. |
| \`className\` | \`string\` | None | Live | Added to the grid's root element, beside its own classes. |
| \`components\` | \`IGridComponents\` | \`{}\` | Live | Your own loading and empty overlays, loading and error rows, and save and lock cells. See [**Custom Components**](?path=/docs/grid-appearance-custom-components--overview). |
| \`labels\` | \`Partial<IGridLabels>\` | \`GRID_LABELS\`, in English | At mount | The strings the grid draws. See [**Appearance**](?path=/docs/grid-appearance--overview). |
| \`colDefs\` | \`{ [colId: string]: IGridColDefOverride }\` | None | When the grid is ready, then on every load | Changes to columns by id, and columns of your own. See [**Columns**](?path=/docs/grid-columns--overview). |
| \`rowSettings\` | \`IGridRowSettings\` | None | Whenever the grid asks | \`onGetLock\` locks a record as a whole: see [**Editing**](?path=/docs/grid-editing--overview). \`onGetHeight\` sets \`result.height\`, in pixels, for one row. |
| \`state\` | \`GridState\`, from AG Grid | None | At mount | The AG Grid state the grid starts from. See *Remembering the layout* on [**Columns**](?path=/docs/grid-columns--overview). |
| \`onOpenRecord\` | \`(params: IGridOpenRecordParams) => void\` | None: the provider's \`openDatasetItem\` | Live | Replaces opening a record from a link or a double-click. Gets \`{ record, reference, columnName }\`. |
| \`onGridReady\`, \`onDestroyed\` | \`(runtime: IGridRuntime) => void\` | None | Live | See *onGridReady and onDestroyed* below. |
| \`onDataLoaded\`, \`onRowClicked\` and the other events | Functions | None | Live | See *Events* below. |

A prop read at mount keeps the value the grid mounted with. To change one, render the grid again with a new \`key\`, such as \`key={String(isEditable)}\`. The grid then starts over, without its scroll position, its focus or the save status of its rows.

## Sizing

**Without \`height\`**, the grid grows with its rows:

- The rows area grows up to \`maxVisibleRows\` × \`rowHeight\` (630px by default), then scrolls.
- The header and the totals row are added on top.
- With no rows, the rows area stays 135px tall for the *No records found.* message.
- Taller rows use up the cap sooner, so fewer rows fit.

**With \`height\`**, the grid is exactly that tall and its rows scroll inside it. \`maxVisibleRows\` is ignored. \`'100%'\` fills a parent that has its own height.

**In both cases**, the grid is at least 220px tall, so \`height='150px'\` still draws 220px.

{{story: Invoice lines that grow}}

{{story: Fill its container}}

## Events

Every event is a prop. The grid calls the callback you passed last, so a callback can read your component's state without a remount.

| Event | Arguments | When it fires |
|---|---|---|
| \`onDataLoaded\` | None | After every load of the provider, such as \`refresh()\`, a page, a sort or a filter, once the grid has its new columns and rows. At mount, a provider that has already loaded fires it once, before \`onGridReady\`. |
| \`onLoadingChanged\` | \`isLoading: boolean\` | When the provider starts or stops loading. A load already running at mount does not fire \`true\`: read \`provider.isLoading()\` for that. |
| \`onRecordValueChanged\` | \`record: IRecord\`, \`columnName: string\`, \`newValue: any\` | When a value in a record changes, whether the user edited it or your code called \`record.setValue()\`. |
| \`onBeforeRecordSaved\` | \`record: IRecord\` | When a record starts to save, before its values are checked. |
| \`onAfterRecordSaved\` | \`result: IRecordSaveOperationResult\`: \`{ recordId, success, fields, errors? }\` | Once for every record that saves: on auto-save, on \`record.save()\`, and for each record of \`provider.save()\`. A save refused because a value is not valid fires it too, with \`success: false\` and the \`errors\`. |
| \`onAfterSaved\` | \`results: IRecordSaveOperationResult[]\` | Only after \`provider.save()\`, once every record in it has finished. Auto-save never fires it. |
| \`onError\` | \`message: string\`, \`details?: any\` | When the provider reports an error, such as a load that failed. |
| \`onEditedCellChanged\` | \`cell: { recordId, columnName }\` or \`undefined\` | When an editor opens or closes, and when the user steps into or out of a one-click cell. |
| \`onCellDoubleClicked\` | \`record: IRecord\`, \`columnName: string\` | When the user double-clicks a cell of a provider column, whether or not the record then opens. Group rows and the totals row fire it too. |
| \`onRowClicked\` | \`record: IRecord\` | When the user clicks a row. Group rows and the totals row fire it too. With the row selection module, a click on the checkbox, on a cell's commands, or a plain click on a group row does not. |
| \`onFocusedCellChanged\` | \`record?: IRecord\`, \`columnName?: string\` | Each time a cell takes focus, even one that already had it. Both are \`undefined\` when the focus lands outside the rows. |
| \`onColumnsChanged\` | \`columns: IColumn[]\` | After the user resizes or moves a column, with the provider's columns, which hold the new \`visualSizeFactor\` or \`order\`. |
| \`onGridReady\` | \`runtime: IGridRuntime\` | Once, when AG Grid is ready. |
| \`onDestroyed\` | \`runtime: IGridRuntime\` | Once, as the grid unmounts, while AG Grid still answers. |

A group row and the totals row are records of their own. A handler that only wants real records skips a record whose \`record.getDataProvider().getSummarizationType()\` is not \`'none'\`: see *Group rows and the totals row are records too* on [**Grouping and totals**](?path=/docs/grid-modules-grouping-and-totals--overview).

In what order they fire:

- **Mount** with a provider that has loaded: \`onDataLoaded\`, then \`onGridReady\`. With a provider still loading: \`onGridReady\`, then \`onLoadingChanged(false)\` and \`onDataLoaded\` once it is in.
- **A load**, such as \`refresh()\`, a page or a sort: \`onLoadingChanged(true)\`, \`onLoadingChanged(false)\`, \`onDataLoaded\`.
- **An edit with auto-save on**: \`onRecordValueChanged\`, \`onBeforeRecordSaved\`, \`onAfterRecordSaved\`.
- **\`provider.save()\`**: \`onLoadingChanged(true)\`, \`onBeforeRecordSaved\` for each changed record, \`onAfterRecordSaved\` for each, \`onLoadingChanged(false)\`, \`onAfterSaved\`.
- **Unmount**: \`onDestroyed\`.

{{story: Watch every event}}

{{story: Ticket queue with a preview pane}}

## onGridReady and onDestroyed

Both hand you the grid's runtime: its services, its hooks and its events, described on [**Extending**](?path=/docs/grid-extending--overview).

- \`onGridReady\` fires once, when AG Grid is ready. From then on, \`runtime.services.get('gridApi')\` returns AG Grid's api. With a provider that has already loaded, the rows are in by then and \`onDataLoaded\` has fired.
- \`onDestroyed\` fires once, as the grid unmounts and before AG Grid tears down, so \`gridApi\` still answers. Read what you want to keep there, such as \`gridApi.getState()\`.

A module cleans up on the runtime's own \`onDestroyed\` event instead, which fires later, once AG Grid is gone: see [**Write a module**](?path=/docs/grid-extending-write-a-module--overview).
`

const meta = {
    title: 'Grid/Get started/Props and events',
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

export const InvoiceLinesThatGrow: Story = {
    name: 'Invoice lines that grow',
    render: () => renderStory(<InvoiceLinesExample />),
    parameters: {
        docs: {
            description: {
                story: `An invoice form's line items. The grid has no \`height\`, so it grows with its lines up to \`maxVisibleRows\` and then scrolls. Add lines until it scrolls, move the slider to change \`maxVisibleRows\` while the grid stays mounted, or remove lines to see the grid stay 220px tall however few it holds.`,
            },
        },
    },
}

export const FillItsContainer: Story = {
    name: 'Fill its container',
    render: () => renderStory(<FillContainerExample />),
    parameters: {
        docs: {
            description: {
                story: `With \`height='100%'\`, the grid takes up its whole container and resizes with it. Move the slider to change the container's height.`,
            },
        },
    },
}

export const WatchEveryEvent: Story = {
    name: 'Watch every event',
    render: () => renderStory(<WatchEveryEventExample />),
    parameters: {
        docs: {
            description: {
                story: `A support queue with editing on, beside a log of every event prop as it fires. Edit a ticket with Auto-save on, then off and press Save all; sort or resize a column; press Remount to see \`onDestroyed\`, then \`onDataLoaded\` before \`onGridReady\`.`,
            },
        },
    },
}

export const TicketQueueWithAPreviewPane: Story = {
    name: 'Ticket queue with a preview pane',
    render: () => renderStory(<TicketPreviewPaneExample />),
    parameters: {
        docs: {
            description: {
                story: `A service desk works through its queue: \`onRowClicked\` and \`onFocusedCellChanged\` show the ticket in the pane, so the arrow keys move through the queue too. With \`enableNavigation={false}\` a double-click opens nothing by itself, and \`onCellDoubleClicked\` opens the ticket in a panel.`,
            },
        },
    },
}
