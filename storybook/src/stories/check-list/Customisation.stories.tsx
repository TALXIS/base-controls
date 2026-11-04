import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { CustomCheckExample, ItemPanelExample, ReadOnlyExample, ReleaseBoardExample } from '../../check-list/checkListExamples'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `
Apart from its three columns, a checklist is a grid, so you customise it the way you customise a grid: with modules, column definitions, cells and events. Try it below: hover the owner cell of an unassigned item and pick *Assign to me*.

{{canvas: Run a release board}}

## Make it read-only

Without the editing module, \`modules={[]}\`, nothing can be ticked, renamed, added, deleted or dragged.

{{story: Keep a finished plan for reference}}

## Add grid features

The checklist's columns take everything a grid column does through \`colDefs\`, as on [**Columns**](?path=/docs/controls-grid-columns--overview). The release board above colours overdue dates, locks finished items, adds *Assign to me* as a cell command and totals the estimates with the aggregation module.

\`modules\` replaces the default editing module:

- Add \`license\`, \`editing\`, \`rowSelection\`, \`clipboard\`, \`aggregation\`, \`legacyClientApiCompatibility\` or your own.
- Leave out sorting, filtering and grouping, which change the order, and cell selection, which turns dragging off.

## Replace pieces of its cells

The checkbox and name columns are drawn by the checklist's own cells. Through \`colDefs\`, their \`cellRendererParams.components\` take the grid cell's pieces, from [**Custom cells**](?path=/docs/controls-grid-appearance-custom-cells--overview), plus a piece of their own:

| Column | Piece | Slots |
|---|---|---|
| Completed | \`checkbox\` | \`onRenderButton\`, the button; \`onRenderCheck\`, the check inside it |
| Name | \`name\` | \`onRenderContainer\`, the box that carries the strike-through |

Replacing a slot keeps the cell's behaviour: ticking and saving work as before.

{{story: Tick items off with a star}}

## Open an item

Make the name column primary to draw names as links, and handle \`onOpenRecord\` to decide what opening one does; here it opens the item in a form in a panel.

{{story: Open an item in a panel}}

## From your code

The checklist adds a module to the grid: \`useGridModule('checkList')\` in a part the grid draws, or \`grid.modules.find('checkList')\` from \`onReady\`. It offers \`isItem(record)\`, which tells an item from the row that adds one, \`isCompleted(record)\` and \`getFieldMapping()\`. Everything else is the grid's: see [**Talking to the grid**](?path=/docs/controls-grid-talking-to-the-grid--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Saving changes', iconName: 'Save', href: '?path=/docs/controls-checklist-saving-changes--overview', text: 'What every tick, drag, new item and delete writes, and sending it to your API.' },
    { title: 'Columns', iconName: 'TripleColumn', href: '?path=/docs/controls-grid-columns--overview', text: 'Everything colDefs can do to a column.' },
    { title: 'Custom cells', iconName: 'Edit', href: '?path=/docs/controls-grid-appearance-custom-cells--overview', text: 'The grid cell\'s pieces and slots, which the checklist\'s cells take too.' },
]

const meta = {
    title: 'Controls/Checklist/Customisation',
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
}

export const TickItemsOffWithAStar: Story = {
    name: 'Tick items off with a star',
    render: () => renderStory(<CustomCheckExample />),
    parameters: {
        docs: {
            description: {
                story: `\`colDefs\` hands the completion cell a star through \`components.checkbox.onRenderCheck\`. Try: tick an item off.`,
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
                story: `The names are links, and \`onOpenRecord\` opens the item in a form. Try: click an item's name.`,
            },
        },
    },
}
