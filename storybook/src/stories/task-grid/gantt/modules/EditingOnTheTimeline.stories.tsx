import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GanttEditingExample } from '../../../../task-grid/examples/ganttExamples'

const DESCRIPTION = `
On the timeline, a task's dates are the ends of its bar, so the quickest way to reschedule a task is to drag it. Three modules let the user change tasks right there: move and resize bars, draw new tasks, and select tasks. Every change is saved through the store, as an edit in the grid is: see *Dates* on [**Get started**](?path=/docs/controls-taskgrid-gantt-get-started--overview).

{{story: Plan on the timeline}}

## Move and resize bars

\`createBarDraggingModule()\` lets the user drag a bar to move the task, or drag either end to change its start or end. The bar snaps as described under *Dates* on [**Get started**](?path=/docs/controls-taskgrid-gantt-get-started--overview), and the dates are saved once it is dropped. It needs \`enableEditing\`, and a task that is locked or saving cannot be dragged.

| Option | Default | Description |
|---|---|---|
| \`enableMove\` | \`true\` | Dragging a bar. |
| \`enableResize\` | \`true\` | Dragging a bar's ends. |

## Draw a task

\`createTaskDrawingModule()\`: hold Ctrl and drag over a row to draw a new task, with its dates shown as you go. The task is created under the row's parent, first among its siblings. It needs \`enableCreation\`.

| Option | Description |
|---|---|
| \`components\` | See *Changing how it looks* below. |

## Select tasks

\`createTaskSelectionModule()\` selects tasks from the chart, in the same selection as the grid's:

| Gesture | Does |
|---|---|
| Click | Selects the task |
| Ctrl+click | Adds or removes it |
| Shift+click | Selects a range |
| Shift+drag | Selects every bar under the band |
| Double-click | Opens the task, as *Edit* does |

| Option | Default | Description |
|---|---|---|
| \`enableSelectionBox\` | \`true\` | Shift+drag. |

## Changing how it looks

\`createTaskDrawingModule\` takes \`components\`, read at mount; bar dragging and selection draw nothing of their own. How slots work is under *Changing how it looks* on [**Grid › Appearance**](?path=/docs/controls-grid-appearance--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`preview\` | \`onRenderRow\`, \`onRenderSpan\`, \`onRenderCallout\`, \`onRenderText\` | \`TaskDrawingUiPreviewComponents\` | The span being drawn and its dates |
`

const meta = {
    title: 'Controls/TaskGrid/Gantt/Modules/Editing on the timeline',
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

export const PlanOnTheTimeline: Story = {
    name: 'Plan on the timeline',
    render: () => renderStory(<GanttEditingExample />),
    parameters: {
        docs: {
            description: {
                story: `The sample projects with all three modules. Try: drag a bar a week later and watch its dates change in the grid, hold Ctrl and draw a task, or Shift+drag over a few bars to select them.`,
            },
        },
    },
}
