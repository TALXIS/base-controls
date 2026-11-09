import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { TicketPreviewPaneExample, WatchEveryEventExample } from '../../grid/examples/propsAndEventsExamples'

const DESCRIPTION = `
A grid is set up through props: the modules it has, how it looks and where it keeps the user's place. Its events, on the grid and on its provider, tell your page what the user did and what the grid loaded. Try it below: edit a ticket and watch the log.

{{canvas: Watch every event}}

## Change a prop that is read at mount

Each prop is read either *Live*, each time the grid needs it, or *At mount*, once; \`modules\` and every module's options are read at mount too. To change one of those, render the grid again with a new \`key\`, such as \`key={String(isEditable)}\`, as the example does when you switch *Auto-save*.

The grid then starts over. Its rows lose their save status, and it loses its scroll position, open groups and focus unless it has a \`stateKey\` (see [**State**](?path=/docs/controls-grid-state--overview)).

## Follow saves

The provider raises the save events:

| Event | Fires |
|---|---|
| \`onBeforeRecordSaved(record)\` | When a record starts to save, before its values are checked |
| \`onAfterRecordSaved(result)\` | Once for every record that saves: on auto-save, on \`record.save()\`, and for each record of \`provider.save()\`. A save refused for an invalid value fires it too, with \`success: false\` and the \`errors\` |
| \`onAfterSaved(results)\` | Only after \`provider.save()\`, once every record in it has finished; auto-save never fires it |

A save changes no value, so \`onRecordColumnValueChanged\` does not fire for it: a save bar that counts the changes listens to \`onAfterSaved\` too. How saving works is on [**Editing**](?path=/docs/controls-grid-modules-editing--overview).

## Drive the page around the grid

Subscribe in \`onSetup\`, which receives each new grid before it loads. Listeners on the grid and its services go with the grid; the provider can outlive it, so the first example removes its listeners on \`onDestroyed\` (see *Clean up* on [**Write a module**](?path=/docs/controls-grid-extending-write-a-module--overview)). A listener is added once per mount, so pass a state setter, or read what changes through a ref. A module's events, such as editing's \`onEditedCellChanged\`, are reached with \`grid.modules.observe(name, …)\`, as the first example does.

{{story: Ticket queue with a preview pane}}

## Reference

### Props

The grid takes no strings as props: its labels are on [**Localization**](?path=/docs/concepts-localization--overview).

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| \`modules\` | \`IGridModule[]\` | Required | At mount | The features, in load order; a row model is required. See [**Modules**](?path=/docs/controls-grid-modules--overview). |
| \`enableNavigation\` | \`boolean\` | \`true\` | At mount | Draws lookups, emails, phones, URLs and the primary column as links, and opens a record on a double-click in a grid without the editing module. |
| \`enableOptionSetColors\` | \`boolean\` | \`false\` | At mount | Draws options that have a colour as tags. |
| \`enableZebra\` | \`boolean\` | \`true\` | At mount | Shades every other row. |
| \`rowHeight\` | \`number\` | \`42\` | At mount | A row's height, in pixels. |
| \`maxVisibleRows\` | \`number\` | \`15\` | Live | How many rows a grid without \`height\` grows to before it scrolls. |
| \`height\` | \`string\` | None | Live | The grid's height, as a CSS length; without one the grid grows with its rows. See *Size the grid* on [**Appearance**](?path=/docs/controls-grid-appearance--overview). |
| \`className\` | \`string\` | None | Live | Added to the grid's root element. |
| \`components\` | \`IGridComponents\` | \`{}\` | Live | The overlays and the loading and error rows. See [**Overlays and rows**](?path=/docs/controls-grid-appearance-overlays-and-rows--overview). |
| \`stateKey\` | \`string\` | None | At mount | The key the user's place is kept under. See [**State**](?path=/docs/controls-grid-state--overview). |
| \`onSetup\` | \`(grid: IGrid) => void\` | None | At mount | Gets each new grid before it loads; keep it and subscribe here. See [**Talking to the grid**](?path=/docs/controls-grid-talking-to-the-grid--overview). |
| \`onLoad\` | \`(grid: IGrid) => void \\| Promise<void>\` | None | At mount | Awaited after the modules load and before AG Grid renders, on every mount. |

Columns, row heights, locks and what opening a record does are set with hooks in \`onSetup\`: see [**Columns**](?path=/docs/controls-grid-columns--overview) and [**Hooks**](?path=/docs/controls-grid-extending-hooks--overview).

### Events

\`provider\`, \`columns\`, \`rows\` and \`cells\` are the grid's services of those keys, such as \`grid.services.get('rows')\`. The provider's other events are under *Reference* on [**Data providers**](?path=/docs/concepts-data-providers--overview).

| Emitter | Event | Arguments | When it fires |
|---|---|---|---|
| \`grid.events\` | \`onDataLoaded\` | None | After every load of the provider, once the grid has its new columns and rows. |
| \`provider\` | \`onLoading\` | \`isLoading: boolean\` | When the provider starts or stops loading. |
| \`provider\` | \`onRecordColumnValueChanged\` | \`record\`, \`columnName\`, \`newValue\` | When a value changes, edited by the user or set by \`record.setValue()\`. |
| \`provider\` | \`onBeforeRecordSaved\`, \`onAfterRecordSaved\`, \`onAfterSaved\` | \`record\`, \`result\`, \`results\` | See *Follow saves*. |
| \`provider\` | \`onError\` | \`message: string\`, \`details?: any\` | When the provider reports an error, such as a failed load. |
| \`columns.events\` | \`onCellDoubleClicked\` | \`record\`, \`columnName\` | On a double-click on a provider column's cell, group rows and the totals row included. |
| \`columns.events\` | \`onColumnsChanged\` | \`columns: IColumn[]\` | After the user resizes or moves a column, with the provider's columns updated. |
| \`rows.events\` | \`onRowClicked\` | \`record: IRecord\` | On a click on a row, group rows and the totals row included. With row selection, a click on the checkbox, on a cell's commands or a plain click on a group row does not fire it. |
| \`cells.events\` | \`onFocusedCellChanged\` | \`record?\`, \`columnName?\` | Each time a cell takes focus; both are \`undefined\` when the focus leaves the rows. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Talking to the grid', iconName: 'Plug', href: '?path=/docs/controls-grid-talking-to-the-grid--overview', text: 'Keep the grid onSetup passes you and drive it from your code.' },
    { title: 'Modules', iconName: 'Puzzle', href: '?path=/docs/controls-grid-modules--overview', text: 'The features you pass in modules, and their options.' },
    { title: 'Editing', iconName: 'Edit', href: '?path=/docs/controls-grid-modules-editing--overview', text: 'Edit values in place and save them, one by one or all at once.' },
]

const meta = {
    title: 'Controls/Grid/Props and events',
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

export const WatchEveryEvent: Story = {
    name: 'Watch every event',
    render: () => renderStory(<WatchEveryEventExample />),
}

export const TicketQueueWithAPreviewPane: Story = {
    name: 'Ticket queue with a preview pane',
    render: () => renderStory(<TicketPreviewPaneExample />),
    parameters: {
        docs: {
            description: {
                story: `The rows' \`onRowClicked\` and the cells' \`onFocusedCellChanged\` show the focused ticket beside the grid, and the columns' \`onCellDoubleClicked\` opens it in a panel. Try: move through the queue with the arrow keys.`,
            },
        },
    },
}
