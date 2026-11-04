import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { CustomCheckExample, ItemPanelExample, ReadOnlyExample, ReleaseBoardExample } from '../../check-list/checkListExamples'

const DESCRIPTION = `
Apart from its three columns, a checklist is a grid, so you customize it the way you customize a grid: with modules, column definitions, cells and events. Try it below: a release board built from grid features. Hover an item without an owner, then tick an overdue one off.

{{canvas: Run a release board}}

## Make it read-only

Without the editing module, \`modules={[]}\`, nothing can be ticked, renamed, added, deleted or dragged.

{{story: Keep a finished plan for reference}}

## Add grid features

Everything [**Grid**](?path=/docs/controls-grid-columns--overview) offers works on the checklist's columns: \`colDefs\`, cell colours, locks, cell commands and events. The release board above uses all four. Of the modules, \`modules\` takes \`license\`, \`editing\`, \`rowSelection\`, \`clipboard\`, \`aggregation\`, \`legacyClientApiCompatibility\` and your own; sorting, filtering and grouping would change the order, and cell selection turns dragging off, so they are left out.

## Replace pieces of its cells

The checkbox and name columns are drawn by the checklist's own cells. Through \`colDefs\`, their \`cellRendererParams.components\` take the [**grid cell's pieces**](?path=/docs/controls-grid-appearance-custom-cells--overview), plus a piece of their own:

| Column | Piece | Slots |
|---|---|---|
| Completed | \`checkbox\` | \`onRenderButton\`, the button; \`onRenderCheck\`, the check inside it |
| Name | \`name\` | \`onRenderContainer\`, the box that carries the strike-through |

Replacing a slot keeps the cell's behaviour: here the check becomes a star, and ticking, saving and the pop still work.

{{story: Tick items off with a star}}

## Open an item

Make the name column primary to draw names as links, and handle \`onOpenRecord\` to decide what opening one does; here it opens the item in a form in a panel.

{{story: Open an item in a panel}}

## From your code

The checklist adds a module to the grid: \`useGridModule('checkList')\` in a part the grid draws, or \`grid.modules.find('checkList')\` from \`onReady\`. It offers \`isItem(record)\`, which tells an item from the row that adds one, \`isCompleted(record)\` and \`getFieldMapping()\`. Everything else is the grid's: see [**Talking to the grid**](?path=/docs/controls-grid-talking-to-the-grid--overview).
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
                story: `The launch is over, and the plan is kept for reference with \`modules={[]}\`.`,
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
                story: `Overdue dates coloured, the name and due date of finished items locked, *Assign to me* on unassigned items, and the estimates totalled.`,
            },
        },
    },
}

export const TickItemsOffWithAStar: Story = {
    name: 'Tick items off with a star',
    render: () => renderStory(<CustomCheckExample />),
    parameters: {
        docs: {
            description: {
                story: `\`colDefs\` hands the completion cell a star through \`components.checkbox.onRenderCheck\`.`,
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
                story: `The names are links, and \`onOpenRecord\` opens the item in a form.`,
            },
        },
    },
}
