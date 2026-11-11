import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../task-grid/guide/GuideSteps'
import { TheTimelineExample } from '../../../../task-grid/guide/basics/theTimelineExamples'

const STEP = 'The timeline'

const DESCRIPTION = `
{{block: progress}}

A move has dates to keep: the fit-out has to be done before the movers come. A Gantt chart beside the tree shows when each task runs, and the team reschedules a task by dragging its bar.

{{canvas: The timeline}}

## How it works

This step adds the chart to the plan of *Let users plan*. In **Code**, the new lines carry \`//new:\`.

\`TaskGantt\` draws the tasks of the control on a timeline, row for row with the grid. \`TaskGantt.Split\` puts the two side by side, the \`TaskGrid\` first, with a handle between them to resize; \`defaultGanttSize\` sets the chart's share of the width, \`60\` percent unless you set it. One view keeps the grid to the columns that fit beside the chart. The chart reads the dates through \`startDate\` and \`endDate\` in the field mapping, and shows an error without them. \`TaskGantt\` and its modules come from their own entry, \`@talxis/base-controls/gantt\`.

Each feature of the chart is a module in \`TaskGantt\`'s \`modules\`, and the chart cannot do without a library module: \`createLibraryModule()\` draws with the free build of <a href="https://dhtmlx.com/docs/products/dhtmlxGantt/" target="_blank" rel="noreferrer">DHTMLX Gantt</a>. With a PRO licence, pass your build to \`createProLibraryModule({ Gantt })\` instead, and import its stylesheet yourself.

**Dates and bars.** A date-only column means the whole day, so a bar runs to the end of its last day.

| The task has | The chart draws |
|---|---|
| A start and a later end | A bar from the start to the end |
| The same day as start and end, in date-only columns | A bar one day long |
| Only a start, or only an end | A milestone on that date |
| No dates, or an end before its start | Nothing in its row |

A bar is filled as far as the task's \`percentComplete\`, and a task with subtasks has a thinner summary bar, drawn from its own dates.

**Moving about the chart.**

| To | The user |
|---|---|
| Zoom | Drags \`TaskGantt.ZoomSlider\`, or turns the mouse wheel over the chart while holding Ctrl |
| Scroll | Drags an empty part of the timeline |
| See every task, or today | Clicks *Zoom to fit* or *Go to today*, which the chart adds to \`TaskDatasetControl.Ribbon\` |
| Find one task | Points at its *Task* cell and clicks *Show on timeline* |

**Changing the plan on the chart.**

| Gesture | Does | Module |
|---|---|---|
| Drag a bar, or one of its ends | Moves the task, or changes that date | \`createBarDraggingModule()\` |
| Ctrl+drag along a row | Draws a new task over that stretch, just before the row's task | \`createTaskDrawingModule()\` |
| Click, Ctrl+click or Shift+drag | Selects the task, adds it to the selection, or selects the bars under the band | \`createTaskSelectionModule()\` |
| Double-click a bar | Opens the task | \`createTaskSelectionModule()\` |

A dropped bar saves its dates as an edit in a cell does, so dragging bars needs \`enableEditing\` and \`createTaskEditingModule()\` in \`TaskGrid\`, both from *Let users plan*. Drawing a task needs \`enableCreation\`.

## Try it

- Press *Expand one level* twice, then drag the bar of *Paint the meeting rooms* a few days to the right: its *Start* and *Due* in the grid move by the same number of days.
- Hold Ctrl and drag along an empty stretch of the row of *Move in*: a new task appears just above it, with the dates you drew.
- Drag the zoom slider to the left to zoom out, then click *Zoom to fit*: the whole plan fits the chart again.

## Remember

- \`TaskGantt\` in \`TaskGantt.Split\`, beside the \`TaskGrid\`, draws the same tasks on a timeline; it needs \`startDate\` and \`endDate\` in the field mapping.
- Every feature of the chart is a module, and a library module is always one of them.
- Dragging a bar saves like an edit in the grid, so it needs \`enableEditing\` and the editing module.

You have a working plan: tasks your users create, edit and move, organised in views and laid out on a timeline. Features adds what plans need beside their tasks.

{{block: navigation}}
`

const meta = {
    title: 'Controls/TaskGrid/Guide/Basics/The timeline',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { progress: () => <GuideProgress current={STEP} />, navigation: () => <GuideNavigation current={STEP} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const TheTimeline: Story = {
    name: 'The timeline',
    tags: ['!dev'],
    render: () => renderStory(<TheTimelineExample />),
}
