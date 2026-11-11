import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../task-grid/guide/GuideSteps'
import { ATooltipOfYourOwnExample, ColoursByStatusExample, ContentOnTheBarsExample, PeopleInCellsExample } from '../../../../task-grid/guide/advanced/makeItYoursExamples'

const STEP = 'Make it yours'

const DESCRIPTION = `
{{block: progress}}

The plan works, and now it should read at a glance: what is waiting, who does the work and how far each task has got. Each example on this step makes one such change to the office move with a slot, a hook or a small Gantt module, and the rest of the task grid keeps working as before.

{{canvas: Colours by status}}

## How it works

Each example starts from the plan of [**The timeline**](?path=/docs/controls-taskgrid-guide-basics-the-timeline--overview), cut to what its change needs, and its new lines carry \`//new:\`. There are three ways to change how something is drawn, and the colours above use all three:

| To change | Use | Above |
|---|---|---|
| A piece that a component or module draws | A slot in its \`components\` | The bar in *% done*, in the hue of the task's status |
| How the grid's cells look | A hook on one of the grid's services, added in \`TaskGrid\`'s \`onSetup\` | The tint of a waiting or finished row |
| What the chart draws | A Gantt module of your own, with hooks on the chart | The colour of a bar |

Every slot of the task grid, the Gantt and their modules is under *Slots* on [**Reference**](?path=/docs/controls-taskgrid-reference--overview), and how slots work is on [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

**A cell's slots.** The task grid draws the subject column with \`TaskGrid.TreeCell\`, and the \`percentComplete\` column of the field mapping, here *% done*, with \`TaskGrid.PercentCompleteCell\`. Their slots go in the column's \`cellRendererParams.components\`, set from a column definitions hook at \`TASK_GRID_PRIORITY.tree + 1\`, once the task grid has given the columns their cells. A component drawn in a cell reads the cell and its task with \`useGridCell()\`, as \`StatusProgress\` does. The slots every cell has are on [**Custom cells**](?path=/docs/controls-grid-appearance-custom-cells--overview).

**The cells' theme.** A \`theme\` hook on the grid's \`cells\` service runs for every cell, and again when its task changes. \`builder.tint(hue)\` tints the cell's background and text, \`'subtle'\` unless you pass \`'strong'\` or \`'solid'\`; how a theme is built is on [**Theming**](?path=/docs/concepts-theming--overview).

**A Gantt module of your own** is an object with a \`name\` and an \`onLoad(gantt)\`, in \`TaskGantt\`'s \`modules\` beside the library's. The chart's \`tasks\` service comes with the chart, so \`gantt.services.observe('tasks', …)\` waits for it, and its \`task\` hook sets what DHTMLX draws for each task, such as its \`color\`. [**Write a module**](?path=/docs/controls-taskgrid-guide-advanced-write-a-module--overview) covers modules in full, and how to name yours for TypeScript.

## People in cells

{{canvas: People in cells}}

The lookup-many module of [**People and tags**](?path=/docs/controls-taskgrid-guide-features-people-and-tags--overview) draws each record in a cell with its \`components.cell.onRenderPill\` slot. It fits as many as the cell has room for and counts the rest in a **+N**, whose tooltip lists them with the same slot, so a slot of yours changes both. Drawn as a \`LookupManyUiPill\` with a label of your own, a person still opens when it is clicked. The slot draws the records of every column of the module; the picker a cell is edited in has slots of its own, under \`components.editor\`.

## A tooltip of your own

{{canvas: A tooltip of your own}}

\`components.onRender\` on \`createTaskTooltipModule\` returns the whole tooltip. Compose it of \`TaskTooltip\`'s parts and parts of your own, in any order:

| Part | Draws |
|---|---|
| \`TaskTooltip.Callout\` | The box beside the pointer, around the other parts |
| \`TaskTooltip.Header\` | The task's name, with the option of \`statusColumnName\` as a pill in its colour |
| \`TaskTooltip.FieldRows\`, \`TaskTooltip.FieldRow\` | Rows of a label and a value; \`FieldRow\` shows a column of the task, nothing while it is empty |
| \`TaskTooltip.ProgressRow\` | The \`percentComplete\` as a bar |
| \`TaskTooltip.DateRangeRow\`, \`StartDateRow\`, \`EndDateRow\`, \`DurationRow\` | When the task runs, read from its bar, so they follow a bar being dragged |

A part of yours reads the task under the pointer with \`useTaskTooltip()\`: its \`record\`, the chart's \`task\`, the bar's \`span\` or the \`milestone\`, the \`duration\` in minutes, the bar's \`color\` and the \`gantt\`. \`RecordCardFieldRow\` draws a row like the library's. The tooltip lets clicks through to the chart, so it cannot hold a button.

## Content on the bars

{{canvas: Content on the bars}}

A Gantt module's \`gantt.hooks.chartConfig\` hands you DHTMLX's chart before it is drawn, and with it the chart's <a href="https://docs.dhtmlx.com/gantt/desktop__templates.html" target="_blank" rel="noreferrer">templates</a>: \`task_text\` inside a bar, \`rightside_text\` and \`leftside_text\` beside it. Your hook runs after the library has set the chart up, so a template you set replaces the library's. A template returns HTML, so escape any text a user typed.

What a template reads, set on the task in a \`task\` hook: DHTMLX keeps any field you add, and the hook runs again when the task changes. The class names in your HTML take their styles from \`gantt.theme.hooks.styles\`, which apply only inside the chart; a \`taskClass\` hook on the \`tasks\` service adds class names to a whole bar.

## Try it

- In *Colours by status*, open *Move to the new office* and *Fit out the space*, double-click the *Status* of *Install the network* and pick *Waiting*: its row, its progress bar and its bar on the timeline turn amber.
- In *People in cells*, open the plan and drag the right edge of the *Assigned to* header to the left until *Move in* shows **+1**, then rest the pointer on it: Tomáš is listed as a chip too.
- In *A tooltip of your own*, open the plan and rest the pointer on the bar of *Install the network*: its priority and 19 hours left are under its name. Drag the bar a week to the right, and the dates in the tooltip move with it.
- In *Content on the bars*, open the plan and drag the bar of *Paint the meeting rooms* a week to the right: the due date beside it moves a week later.

## Remember

- A slot replaces one piece that a component or module draws; every slot is under *Slots* on Reference.
- A hook on a service changes every cell or every bar, and runs again when a task changes.
- A Gantt module of your own reaches the chart: its tasks, its templates and its styles.

{{block: navigation}}
`

const meta = {
    title: 'Controls/TaskGrid/Guide/Advanced/Make it yours',
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

export const ColoursByStatus: Story = {
    name: 'Colours by status',
    tags: ['!dev'],
    render: () => renderStory(<ColoursByStatusExample />),
}

export const PeopleInCells: Story = {
    name: 'People in cells',
    tags: ['!dev'],
    render: () => renderStory(<PeopleInCellsExample />),
}

export const ATooltipOfYourOwn: Story = {
    name: 'A tooltip of your own',
    tags: ['!dev'],
    render: () => renderStory(<ATooltipOfYourOwnExample />),
}

export const ContentOnTheBars: Story = {
    name: 'Content on the bars',
    tags: ['!dev'],
    render: () => renderStory(<ContentOnTheBarsExample />),
}
