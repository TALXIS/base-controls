import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { GuideNavigation } from '../../../task-grid/guide/GuideSteps'
import { BarContentExample, OwnTooltipExample, PeopleInCellsExample, StatusDrivenRowsExample } from '../../../task-grid/guide/MakeItYoursExamples'

const DESCRIPTION = `
Every part of the task grid and the Gantt can be drawn your own way. Each section makes one realistic change.

## Colours by status

A slot in a cell's \`components\`, a hook on the grid's cells or a small Gantt module changes how one thing is drawn, and the rest keeps working. Every slot is under *Changing how it looks* on [**TaskGrid**](?path=/docs/controls-taskgrid-overview--overview), and how slots work is on [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| What | Where |
|---|---|
| The tint of a row | A \`theme\` hook on the grid's \`cells\` service, added in \`TaskGrid\`'s \`onSetup\` |
| The *Overdue* badge | \`columnControl\` in the subject column's \`cellRendererParams.components\`, set from a column definitions hook |
| The progress bar | \`progress\` in the *% Complete* column's \`cellRendererParams.components\` |
| The colour of a bar | A Gantt module with a \`task\` hook on the chart's \`tasks\` service |

Try: set the *Status* of a task to *Waiting*, then set its *% Complete* to 100.

{{story: Colours by status}}

## People in cells

The lookup-many module draws each record in a cell with its \`components.cell.onRenderPill\` slot. It fits as many as the cell has room for and counts the rest in a **+N**, whose tooltip lists them with the same slot, so a slot of yours changes both.

Each task's team as chips with a picture and a first name. Try: point at the **+N** of *Website Redesign*.

{{story: People in cells}}

## A tooltip of your own

\`components.onRender\` on \`createTaskTooltipModule\` returns the whole tooltip, composed of \`TaskTooltip\`'s parts, such as \`Callout\`, \`Header\`, \`ProgressRow\` and \`DateRangeRow\`, and parts of your own. A part of yours reads the task under the pointer with \`useTaskTooltip()\`: its \`record\`, the bar's \`span\` or the \`milestone\`, the \`duration\`, and the \`gantt\`.

The tooltip follows the pointer and lets clicks through to the chart, so it cannot hold a button.

Try: rest the pointer on a bar, then double-click it.

{{story: A tooltip of your own}}

## Content on the bars

A Gantt module's \`hooks.chartConfig\` hands you DHTMLX's chart before it is drawn, and with it the chart's <a href="https://docs.dhtmlx.com/gantt/desktop__templates.html" target="_blank" rel="noreferrer">templates</a>: \`task_text\` inside a bar, \`rightside_text\` and \`leftside_text\` beside it. A \`task\` hook on the \`tasks\` service sets what each task carries, and a \`taskClass\` hook names bars for \`theme.hooks.styles\` to style. The library sets the layout and scales before your hook runs, so leave those to it.

Progress inside the bars, a flag beside critical work and named milestones. Try: click the bar of *Build the site*, then of *Map the redirects*.

{{story: Content on the bars}}

{{block: navigation}}
`

const meta = {
    title: 'Controls/TaskGrid/Guide/Make it yours',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { navigation: () => <GuideNavigation current='Make it yours' /> }),
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
    render: () => renderStory(<StatusDrivenRowsExample />),
}

export const PeopleInCells: Story = {
    name: 'People in cells',
    tags: ['!dev'],
    render: () => renderStory(<PeopleInCellsExample />),
}

export const ATooltipOfYourOwn: Story = {
    name: 'A tooltip of your own',
    tags: ['!dev'],
    render: () => renderStory(<OwnTooltipExample />),
}

export const ContentOnTheBars: Story = {
    name: 'Content on the bars',
    tags: ['!dev'],
    render: () => renderStory(<BarContentExample />),
}
