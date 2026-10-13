import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { TicketPreviewPaneExample, WatchEveryEventExample } from '../../grid/examples/propsAndEventsExamples'

const DESCRIPTION = `
Every prop of \`<Grid />\`, and every event it fires. How to use each is on the page each row links to.

The provider is not a prop: the grid shows the one around it, in a DatasetControl or a \`DataProviderContextProvider\`, and never loads it itself. See *Your first grid* on [**Get started**](?path=/docs/grid-get-started--overview).

## Props

| Prop | Type | Default | Read | Description |
|---|---|---|---|---|
| \`modules\` | \`IGridModules\` | Required | At mount | The features the grid has. \`rowModel\` is the one every grid needs. See [**Modules**](?path=/docs/grid-modules--overview). |
| \`enableNavigation\` | \`boolean\` | \`true\` | At mount | Draws emails, phones, URLs, lookups and the primary column as links, and opens a record on a double-click while editing is off. See *Data types* on [**Data**](?path=/docs/grid-data--overview). |
| \`enableOptionSetColors\` | \`boolean\` | \`false\` | At mount | Draws options that have a colour as tags. See [**Appearance**](?path=/docs/grid-appearance--overview). |
| \`enableZebra\` | \`boolean\` | \`true\` | At mount | Shades every other row. See [**Appearance**](?path=/docs/grid-appearance--overview). |
| \`rowHeight\` | \`number\` | \`42\` | At mount | How tall a row is, in pixels. See [**Appearance**](?path=/docs/grid-appearance--overview). |
| \`maxVisibleRows\` | \`number\` | \`15\` | Live | How many rows the grid grows to before it scrolls, while \`height\` is not set. See *Size the grid* on [**Appearance**](?path=/docs/grid-appearance--overview). |
| \`height\` | \`string\` | None: the grid grows with its rows | Live | How tall the grid is, as a CSS length. Ignored inside a DatasetControl that has a height. See *Size the grid* on [**Appearance**](?path=/docs/grid-appearance--overview). |
| \`className\` | \`string\` | None | Live | Added to the grid's root element, beside its own classes. |
| \`components\` | \`IGridComponents\` | \`{}\` | Live | Your own loading and empty overlays, and loading and error rows. See [**Overlays and rows**](?path=/docs/grid-appearance-overlays-and-rows--overview). |
| \`labels\` | \`Partial<IGridLabels>\` | \`GRID_LABELS\`, in English | At mount | The strings the grid draws. See [**Localization**](?path=/docs/grid-localization--overview). |
| \`colDefs\` | \`{ [colId: string]: IGridColDefOverride }\` | None | When the grid is ready, then on every load | Changes to columns by id, and columns of your own. See [**Columns**](?path=/docs/grid-columns--overview). |
| \`stateKey\` | \`string\` | None | At mount | The key the grid keeps the user's place under: the scroll position, the open groups and the focused cell. Per view inside a DatasetControl. See [**State**](?path=/docs/grid-state--overview). |
| \`rowSettings\` | \`IGridRowSettings\` | None | Each time a row is drawn | \`onGetLock\` locks a record as a whole: see [**Editing**](?path=/docs/grid-modules-editing--overview). \`onGetHeight\` sets \`result.height\`, in pixels, for one row. |
| \`onOpenRecord\` | \`(params: IGridOpenRecordParams) => void\` | The provider's \`openDatasetItem\` | Live | Replaces opening a record from a link or a double-click. Receives \`{ record, reference, columnName }\`. |
| \`onReady\`, \`onDataLoaded\` and the other events | Functions | None | Live | See *Events* below. |

## Change a prop that is read at mount

A prop marked *At mount* keeps the value the grid mounted with, and so do \`modules\` and every module's options. To change one, render the grid again with a new \`key\`, such as \`key={String(isEditable)}\`. The grid then starts over: the save status of its rows is gone, and so are its scroll position, open groups and focus, unless it has a \`stateKey\`.

## Events

Every event of the grid itself is a prop, and a module's events come in through its options, such as \`createEditingModule({ onEditedCellChanged })\`. The grid calls the callback you passed last, so a callback can read your component's state without a remount.

| Event | Arguments | When it fires |
|---|---|---|
| \`onDataLoaded\` | None | After every load of the provider, such as \`refresh()\`, a page, a sort or a filter, once the grid has its new columns and rows. When AG Grid is ready and the provider has already loaded, it fires once, just before \`onReady\`. |
| \`onLoadingChanged\` | \`isLoading: boolean\` | When the provider starts or stops loading. |
| \`onRecordValueChanged\` | \`record: IRecord\`, \`columnName: string\`, \`newValue: any\` | When a value in a record changes, whether the user edited it or your code called \`record.setValue()\`. |
| \`onBeforeRecordSaved\` | \`record: IRecord\` | When a record starts to save, before its values are checked. |
| \`onAfterRecordSaved\` | \`result: IRecordSaveOperationResult\`: \`{ recordId, success, fields, errors? }\` | Once for every record that saves: on auto-save, on \`record.save()\`, and for each record of \`provider.save()\`. A save refused because a value is not valid fires it too, with \`success: false\` and the \`errors\`. |
| \`onAfterSaved\` | \`results: IRecordSaveOperationResult[]\` | Only after \`provider.save()\`, once every record in it has finished. Auto-save never fires it. |
| \`onError\` | \`message: string\`, \`details?: any\` | When the provider reports an error, such as a load that failed. |
| \`onCellDoubleClicked\` | \`record: IRecord\`, \`columnName: string\` | When the user double-clicks a cell of a provider column, whether or not the record then opens. Group rows and the totals row fire it too. |
| \`onRowClicked\` | \`record: IRecord\` | When the user clicks a row. Group rows and the totals row fire it too. With the row selection module, a click on the checkbox, on a cell's commands, or a plain click on a group row does not. |
| \`onFocusedCellChanged\` | \`record?: IRecord\`, \`columnName?: string\` | Each time a cell takes focus, even one that already had it. Both are \`undefined\` when the focus lands outside the rows. |
| \`onColumnsChanged\` | \`columns: IColumn[]\` | After the user resizes or moves a column, with the provider's columns, which hold the new \`visualSizeFactor\` or \`order\`. |
| \`onReady\` | \`grid: IGrid\` | Once, when AG Grid is ready. The grid is what your code talks to: see [**Talking to the grid**](?path=/docs/grid-talking-to-the-grid--overview). |
| \`onDestroyed\` | \`grid: IGrid\` | Once, as the grid unmounts, while AG Grid is still there. |

{{story: Watch every event}}

The events can drive a whole page around the grid, such as a preview of the focused record:

{{story: Ticket queue with a preview pane}}
`

const meta = {
    title: 'Grid/Props and events',
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

export const WatchEveryEvent: Story = {
    name: 'Watch every event',
    render: () => renderStory(<WatchEveryEventExample />),
    parameters: {
        docs: {
            description: {
                story: `A support queue with editing on, beside a log of every event prop as it fires. Try: edit a ticket with *Auto-save* on, then off and press *Save all*; sort or resize a column; press *Remount* to see \`onDestroyed\`, then \`onDataLoaded\` just before \`onReady\`.`,
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
                story: `\`onRowClicked\` and \`onFocusedCellChanged\` show the ticket in a \`Form\` beside the grid, and \`onCellDoubleClicked\` opens it in a panel, with \`enableNavigation={false}\`. Try: move through the queue with the arrow keys, then double-click a ticket.`,
            },
        },
    },
}
