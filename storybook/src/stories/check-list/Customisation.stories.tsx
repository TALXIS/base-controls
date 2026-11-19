import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { CustomCheckExample, ItemPanelExample, ReadOnlyExample, ReleaseBoardExample } from '../../check-list/checklistExamples'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'

const DESCRIPTION = `
Apart from its three columns, a checklist is a grid, so you customise it the way you customise a grid: with modules, column definitions, cells and events. Try it below: hover the owner cell of an unassigned item and pick *Assign to me*.

{{canvas: Run the launch plan}}

## Add grid features

The checklist's columns take everything a grid column does, through a column definitions hook in \`onSetup\`, as [**Shape the columns**](?path=/docs/controls-grid-guide-make-it-yours-shape-the-columns--overview) describes, and the grid's hooks under *Hooks* on Grid's [**Reference**](?path=/docs/controls-grid-reference--overview) reach its cells. The launch plan above colours overdue dates, locks finished items and adds *Assign to me* with theme, lock and commands hooks, and totals the estimates.

\`modules\` replaces the default editing module. Add \`createLicenseModule\`, \`createEditingModule\`, \`createRowSelectionModule\`, \`createClipboardModule\`, \`createAggregationModule\`, \`createLegacyClientApiCompatibilityModule\` or a module of your own. Leave out sorting, filtering and grouping, which change the order, and cell selection, which turns dragging off.

## Make it read-only

Without the editing module, \`modules={[]}\`, nothing can be ticked, renamed, added, deleted or dragged.

{{story: Keep a finished plan for reference}}

## Open an item

Make the name column primary to draw names as links, and add a \`grid.hooks.openRecord\` hook to decide what opening one does, as *Link to the record* on [**Shape the columns**](?path=/docs/controls-grid-guide-make-it-yours-shape-the-columns--overview) describes. Here it opens the item in a [**Form**](?path=/docs/controls-form-get-started--overview) in a panel.

{{story: Open an item in a panel}}

## From your code

The checklist adds a module to the grid: \`useGridModule('checklist')\` returns it in a part the grid draws, \`grid.modules.get('checklist')\` on the grid \`onReady\` passes you, and \`find\` on the one \`onSetup\` passes you, as the launch plan above does. It offers \`isItem(record)\`, which tells an item from the row that adds one, \`isCompleted(record)\` and \`getFieldMapping()\`. Everything else is the grid's: see [**From your code**](?path=/docs/controls-grid-guide-advanced-from-your-code--overview) in the Grid guide.

## Changing how it looks

The checkbox and name columns are drawn by the checklist's own cells. On their column definitions, \`cellRendererParams.components\` take the grid cell's keys under *Cells* on Grid's [**Reference**](?path=/docs/controls-grid-reference--overview), plus a key of their own. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Column | Key | Slots | Default | Draws |
|---|---|---|---|---|
| \`fieldMapping.completed\` | \`checkbox\` | \`onRender\`, \`onRenderCheck\` | \`ChecklistUiCompletionCheckboxComponents\` | The button an item is ticked off with, and the check inside it |
| \`fieldMapping.name\` | \`name\` | \`onRender\` | \`ChecklistUiNameCellComponents\` | The box around the name, which carries the strike-through |

Replacing a slot keeps the cell's behaviour, so ticking and saving work as before.

{{story: Tick items off with a star}}

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Saving changes', iconName: 'Save', href: '?path=/docs/controls-checklist-saving-changes--overview', text: 'What every tick, drag, new item and delete writes, and sending it to your API.' },
    { title: 'Shape the columns', iconName: 'TripleColumn', href: '?path=/docs/controls-grid-guide-make-it-yours-shape-the-columns--overview', text: 'Pin, size and link columns, and edit them in place, from a column definitions hook.' },
    { title: 'Cells and headers of your own', iconName: 'Edit', href: '?path=/docs/controls-grid-guide-make-it-yours-cells-and-headers-of-your-own--overview', text: 'Give a column\'s cells slots of your own, which the checklist\'s cells take too.' },
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
                story: `The launch is over, and the plan is kept for reference with \`modules={[]}\`. Try: click a checkbox, or drag an item.`,
            },
        },
    },
}

export const RunTheLaunchPlan: Story = {
    name: 'Run the launch plan',
    render: () => renderStory(<ReleaseBoardExample />),
}

export const TickItemsOffWithAStar: Story = {
    name: 'Tick items off with a star',
    render: () => renderStory(<CustomCheckExample />),
    parameters: {
        docs: {
            description: {
                story: `The column definitions hook hands the completion cell a star through \`components.checkbox.onRenderCheck\`. Try: tick an item off.`,
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
                story: `The names are links, and an \`openRecord\` hook opens the item in a form. Try: click an item's name.`,
            },
        },
    },
}
