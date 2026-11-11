import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../../grid/showcase/ExploreCards'
import {
    GanttDrawDatesExample, GanttDrawingPreviewExample, GanttDrawTasksExample, GanttEditingExample, GanttMoveOnlyExample, GanttSelectionExample, GanttSnappingExample,
} from '../../../../task-grid/examples/ganttExamples'

const DESCRIPTION = `
With the editing modules, the user plans right on the timeline: drags a bar to new dates, draws a new task where it belongs, and selects tasks on the chart. Every change to a task's dates is saved as an edit in the grid is, through the task store. Try it below: drag a bar a week later.

{{canvas: Plan on the timeline}}

## Move and resize bars

With \`createBarDraggingModule()\`, the user drags a bar to move the task, or one of its ends to change that date; a milestone only moves. The dates, and the duration when it is mapped, are written once the bar is dropped, and the timeline grows as a bar nears its edge. What each kind of task writes is on [**Dates and bars**](?path=/docs/controls-taskgrid-gantt-dates-and-bars--overview).

Bars can be dragged only with \`enableEditing\` and \`createTaskEditingModule()\` in \`TaskGrid\` (see [**Working with tasks**](?path=/docs/controls-taskgrid-working-with-tasks--overview)), and not while their task is locked or saving.

{{story: Move without resizing}}

### Snapping

A dragged bar snaps to the scale. A moved bar keeps its length, and a resized one keeps at least one step.

| The edge's column is | It snaps to |
|---|---|
| Date only | Whole days |
| Date and time | The finest of 15 and 30 minutes, 1, 3, 6 and 12 hours that is at least 12 pixels wide at the zoom, or else whole days |

With [**Non-working days**](?path=/docs/controls-taskgrid-gantt-modules-non-working-days--overview), a bar also slides off the days they cover. To snap in a way of your own, add a \`snap\` hook, as on [**Write a module**](?path=/docs/controls-taskgrid-gantt-write-a-module--overview).

{{story: Snapping by zoom}}

## Draw new tasks

With \`createTaskDrawingModule()\` and \`enableCreation\`, holding Ctrl over the timeline shows the date under the pointer, and Ctrl+drag along a row draws a new task over the span, on a Mac too. The task is created right before the task of that row, under the same parent, with the dates drawn. Everything else about a new task is as on [**Working with tasks**](?path=/docs/controls-taskgrid-working-with-tasks--overview).

{{story: Draw new tasks}}

## Draw the dates of a task

A task without dates has an empty row. With the same module, the user holds Alt, or Option on a Mac, and drags along that row to draw its dates; a drag without Alt scrolls the timeline, as anywhere else. It works for a task with no subtasks that is not locked or saving, and needs what moving bars needs: \`enableEditing\` and \`createTaskEditingModule()\`.

{{story: Draw the dates of a task}}

## Select tasks

With \`createTaskSelectionModule()\`, the user selects tasks on the chart. The selection is the grid's: *Edit* and *Delete* act on it, and the grid shows it with \`createRowSelectionModule()\` (see [**Selection and clipboard**](?path=/docs/controls-grid-modules-selection-and-clipboard--overview)).

| Gesture | Does |
|---|---|
| Click | Selects the task |
| Ctrl+click, or Cmd+click on a Mac | Adds the task to the selection, or takes it out |
| Shift+click | Selects every task from the last one clicked |
| Shift+drag | Selects every bar under the band, unless \`enableSelectionBox\` is \`false\` |
| Double-click | Opens the task, as its subject does |

{{story: Select on the chart}}

## Changing how it looks

\`createTaskDrawingModule\` takes \`components\` for what drawing shows. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`preview\` | \`onRenderRow\`, \`onRenderSpan\`, \`onRenderCallout\`, \`onRenderText\` | \`TaskDrawingUiPreviewComponents\` | The row being drawn on, the span drawn so far, and the callout with its dates |

{{story: A preview of your own}}

## Reference

### Parameters

| Factory | Parameter | Type | Default | Description |
|---|---|---|---|---|
| \`createBarDraggingModule\` | \`enableMove\` | \`boolean\` | \`true\` | Dragging a bar to other dates. |
| | \`enableResize\` | \`boolean\` | \`true\` | Dragging a bar's ends. |
| \`createTaskDrawingModule\` | \`components\` | \`ITaskDrawingComponents\` | Defaults | See *Changing how it looks* above. |
| \`createTaskSelectionModule\` | \`enableSelectionBox\` | \`boolean\` | \`true\` | Shift+drag selects the bars under a band. |

Every parameter is read at mount.

### Members

A module of your own reaches these modules by name, as on [**Write a module**](?path=/docs/controls-taskgrid-gantt-write-a-module--overview).

| Module | Member | Description |
|---|---|---|
| \`taskDrawing\` | \`isEnabled()\` | Whether new tasks can be drawn, which is \`enableCreation\`. |
| | \`create(rowTaskId, span)\` | Creates a task over the span, right before the row's task under the same parent. |
| | \`canDrawDates(taskId)\`, \`drawDates(taskId, span)\` | Whether a task's dates can be drawn, and saves them. |
| \`taskSelection\` | \`isSelected(taskId)\` | Whether the task is selected. |
| | \`select(taskIds, { isAdditive? })\` | Selects exactly these tasks, or adds them to the selection. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Dates and bars', iconName: 'CalendarSettings', href: '?path=/docs/controls-taskgrid-gantt-dates-and-bars--overview', text: 'What a bar, a milestone and an empty row write when they change.' },
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

export const MoveWithoutResizing: Story = {
    name: 'Move without resizing',
    render: () => renderStory(<GanttMoveOnlyExample />),
    parameters: {
        docs: {
            description: {
                story: `Bars that move but keep their length. Try: drag the end of a bar, then the bar itself.`,
            },
        },
    },
}

export const SnappingByZoom: Story = {
    name: 'Snapping by zoom',
    render: () => renderStory(<GanttSnappingExample />),
    parameters: {
        docs: {
            description: {
                story: `Tasks with a time of day, whose bars snap finer the further the timeline is zoomed in. Try: zoom in until the scale shows hours, then drag the end of a bar.`,
            },
        },
    },
}

export const DrawNewTasks: Story = {
    name: 'Draw new tasks',
    render: () => renderStory(<GanttDrawTasksExample />),
    parameters: {
        docs: {
            description: {
                story: `New tasks drawn on the timeline, each before the task of the row it is drawn on. Try: hold Ctrl and drag along the row of *API Platform v2*.`,
            },
        },
    },
}

export const DrawTheDatesOfATask: Story = {
    name: 'Draw the dates of a task',
    render: () => renderStory(<GanttDrawDatesExample />),
    parameters: {
        docs: {
            description: {
                story: `Two tasks without dates, whose dates the user draws on their empty rows. Try: hold Alt, or Option on a Mac, and drag along the row of *Book the venue*.`,
            },
        },
    },
}

export const SelectOnTheChart: Story = {
    name: 'Select on the chart',
    render: () => renderStory(<GanttSelectionExample />),
    parameters: {
        docs: {
            description: {
                story: `Tasks selected on the chart, in the same selection as the grid's. Try: hold Shift and drag a band across several bars.`,
            },
        },
    },
}

export const APreviewOfYourOwn: Story = {
    name: 'A preview of your own',
    render: () => renderStory(<GanttDrawingPreviewExample />),
    parameters: {
        docs: {
            description: {
                story: `A drawn span in green, and a callout that says what is drawn. Try: hold Ctrl and drag along a row.`,
            },
        },
    },
}
