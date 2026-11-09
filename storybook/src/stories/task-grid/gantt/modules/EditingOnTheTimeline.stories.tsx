import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../../grid/showcase/ExploreCards'
import { GanttEditingExample } from '../../../../task-grid/examples/ganttExamples'

const DESCRIPTION = `
Three Gantt modules let the user change tasks on the timeline: move and resize bars, draw new tasks and missing dates, and select tasks. A change to a task's dates saves as an edit in the grid does. Try it below: drag a bar a week later.

{{canvas: Plan on the timeline}}

## Move and resize bars

\`createBarDraggingModule()\` lets the user drag a bar to move the task, or drag either end to change its start or end. The bar snaps as described under *Dates* on [**Gantt**](?path=/docs/controls-taskgrid-gantt-get-started--overview), and the dates are written once it is dropped. It needs \`enableEditing\`, and the dates save straight away with \`createTaskEditingModule()\` in \`TaskGrid\`, as the example has. A task that is locked or saving cannot be dragged.

| Option | Default | Description |
|---|---|---|
| \`enableMove\` | \`true\` | Dragging a bar. |
| \`enableResize\` | \`true\` | Dragging a bar's ends. |

## Draw a task

\`createTaskDrawingModule()\` lets the user draw on the timeline, with the dates shown as the pointer moves:

| Gesture | Does | Needs |
|---|---|---|
| Hold Ctrl | Shows the date under the pointer | \`enableCreation\` |
| Ctrl+drag over a row | Draws a new task under the parent of the row's task, first or last among its siblings as on [**Working with tasks**](?path=/docs/controls-taskgrid-working-with-tasks--overview) | \`enableCreation\` |
| Drag along the empty row of a task with no dates, such as one just made with *New* | Draws that task's dates. Not for a task with subtasks, or one that is locked or saving. | \`enableEditing\` |

Drawn dates save as a dragged bar's do. The module takes \`components\`: see *Changing how it looks* below.

## Select tasks

\`createTaskSelectionModule()\` selects tasks from the chart, in the same selection as the grid's:

| Gesture | Does |
|---|---|
| Click | Selects the task |
| Ctrl+click, or Cmd+click on a Mac | Adds or removes it |
| Shift+click | Selects a range |
| Shift+drag | Selects every bar under the band; \`enableSelectionBox: false\` turns it off |
| Double-click | Opens the task, as *Edit* does |

## Changing how it looks

\`createTaskDrawingModule\` takes \`components\`, read at mount. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`preview\` | \`onRenderRow\`, \`onRenderSpan\`, \`onRenderCallout\`, \`onRenderText\` | \`TaskDrawingUiPreviewComponents\` | The row being drawn on, the span drawn so far, and its dates |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Non-working days', iconName: 'Calendar', href: '?path=/docs/controls-taskgrid-gantt-modules-non-working-days--overview', text: 'Weekends and holidays a dragged bar slides off.' },
    { title: 'Links', iconName: 'Link', href: '?path=/docs/controls-taskgrid-gantt-modules-links--overview', text: 'Let the user draw dependencies between the bars.' },
]

const meta = {
    title: 'Controls/TaskGrid/Gantt/Modules/Editing on the timeline',
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

export const PlanOnTheTimeline: Story = {
    name: 'Plan on the timeline',
    render: () => renderStory(<GanttEditingExample />),
}
