import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ItemPanelExample, ReadOnlyExample, ReleaseBoardExample } from '../../check-list/checkListExamples'

const DESCRIPTION = `
A checklist is a grid with a few columns of its own: an item's name, its hidden position and whether it is finished. Everything else is the grid's, so you customize a checklist the way you customize a grid, through its modules, labels, columns and events. Try it below: a release board built from grid features; hover an item without an owner, then tick an overdue one.

{{canvas: Run a release board}}

## Make it read-only

Without the editing module, \`modules={[]}\`, the list is read-only: no ticking, renaming, adding, deleting or dragging.

{{story: Keep a finished plan for reference}}

## Change its wording

Its strings are labels: see [**Localization**](?path=/docs/concepts-localization--overview).

## Configure the grid

Everything \`Grid\` offers works on the checklist's other columns: column definitions, cell colours, locks, cell commands, events. Of the grid's modules, \`modules\` takes \`license\`, \`editing\`, \`rowSelection\`, \`clipboard\`, \`aggregation\`, \`legacyClientApiCompatibility\` and modules of your own. Sorting, filtering and grouping would change the order, and cell selection turns dragging off, so they are left out.

The release board above colours overdue dates (see *Colour cells by their data* on [**Appearance**](?path=/docs/controls-grid-appearance--overview)), locks the name and due date of finished items (see *Locks* on [**Editing**](?path=/docs/controls-grid-modules-editing--overview)), offers *Assign to me* (see *Add cell commands* on [**Columns**](?path=/docs/controls-grid-columns--overview)) and totals the estimates (see [**Grouping and totals**](?path=/docs/controls-grid-modules-grouping-and-totals--overview)).

## Open an item

A primary column draws the item's name as a link, and \`onOpenRecord\` decides what opening it does. Here it opens the item in a form in a panel. How links and opening work is under *Link to the record* on [**Columns**](?path=/docs/controls-grid-columns--overview); while editing is on, as it is by default, only the link opens an item, not a double-click.

{{story: Open an item in a panel}}

## From your code

The checklist adds its own module to the grid: \`grid.modules.find('checkList')\`, on the grid \`onReady\` or a module's \`onLoad\` passes you, or \`useGridModule('checkList')\` in a part the grid draws. The release board above uses it to tell items from the row that adds one.

| Member | Description |
|---|---|
| \`isItem(record)\` | Whether the record is one of the list's items, not the row that adds one. |
| \`isCompleted(record)\` | Whether the item is finished. |
| \`getFieldMapping()\` | The columns the checklist works with. |

Everything else is the grid's: see [**Talking to the grid**](?path=/docs/controls-grid-talking-to-the-grid--overview).
`

const meta = {
    title: 'Controls/Checklist/Customization',
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

export const KeepAFinishedPlanForReference: Story = {
    name: 'Keep a finished plan for reference',
    render: () => renderStory(<ReadOnlyExample />),
    parameters: {
        docs: {
            description: {
                story: `The launch is over: \`modules={[]}\` keeps the plan for reference. Try: click an item; nothing can be changed.`,
            },
        },
    },
}

export const RunAReleaseBoard: Story = {
    name: 'Run a release board',
    render: () => renderStory(<ReleaseBoardExample />),
    parameters: {
        docs: {
            description: {
                story: `Grid features on a checklist: overdue dates coloured, the name and due date of finished items locked, *Assign to me* on unassigned items, and the estimates totalled. Try: hover an item without an owner, then tick an overdue one.`,
            },
        },
    },
}

export const OpenAnItemInAPanel: Story = {
    name: 'Open an item in a panel',
    render: () => renderStory(<ItemPanelExample />),
    parameters: {
        docs: {
            description: {
                story: `\`isPrimary\` turns the names into links, and \`onOpenRecord\` opens the item in a form. Try: click a name and change the item in the panel.`,
            },
        },
    },
}
