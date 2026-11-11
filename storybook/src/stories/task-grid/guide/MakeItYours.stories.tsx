import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { BarContentExample, OwnTooltipExample, PeopleInCellsExample, StatusDrivenRowsExample } from '../../../task-grid/guide/MakeItYoursExamples'

const DESCRIPTION = `
At the end of this step the task grid looks like your team's plan: rows and bars in the colours of their status, people as faces, a tooltip that says what matters and text on the bars. Each example below changes only how something is drawn, through a slot in a \`components\` map, a hook on the grid's cells or a small Gantt module, so everything else keeps working as before. Try it below: set the *Status* of a task to *Waiting*, then set its *% Complete* to 100.

{{canvas: Status-driven rows}}

## Status-driven rows

The example above takes its colours from each task's *Status*, and marks the tasks still open after their due date. It changes four things, each in its own place:

| What | Where |
|---|---|
| The tint of a row | A \`theme\` hook on the grid's \`cells\` service, added in \`TaskGrid\`'s \`onSetup\` |
| The *Overdue* badge | \`components.treeCell.columnControl\` on \`TaskGrid\`, which draws the subject |
| The progress bar | \`components.percentComplete.progress\` on \`TaskGrid\` |
| The colour of a bar | A Gantt module with a \`task\` hook on the chart's \`tasks\` service |

A slot gets the props its default draws with; how slots and their pieces work is on [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview). A slot is called during render, so to use React hooks, such as \`useGridCell()\` for the cell's task and theme, return a component of your own, as \`ProgressBar\` does. The cell hooks are on [**Hooks**](?path=/docs/controls-grid-extending-hooks--overview), and a cell drawn from scratch is on [**Custom cells**](?path=/docs/controls-grid-appearance-custom-cells--overview).

## People in cells

The lookup-many module draws each record in a cell with its \`components.cell.onRenderPill\` slot. It fits as many as the cell has room for and counts the rest in a **+N**, whose tooltip lists them with the same slot, so a slot of yours changes both. Here each person is a chip with their picture and first name; *team.ts* lists everyone working on a task and under it, so a project has several.

{{story: People in cells}}

## A tooltip of your own

\`components.onRender\` on \`createTaskTooltipModule\` returns the whole tooltip, composed of \`TaskTooltip\`'s parts and parts of your own, starting with \`TaskTooltip.Callout\`. A part of your own reads the task under the pointer with \`useTaskTooltip()\`: its \`record\`, the bar's \`span\` or the \`milestone\`, the \`duration\`, and the \`gantt\` with its services and the task runtime.

| Part | Shows |
|---|---|
| \`TaskTooltip.Callout\` | The callout beside the pointer, which holds the rest |
| \`TaskTooltip.Header\` | The task's name, and its status with \`statusColumnName\` |
| \`TaskTooltip.ProgressRow\` | \`percentComplete\` as a bar |
| \`TaskTooltip.DateRangeRow\` | The start, the end and the duration on one line; \`StartDateRow\`, \`EndDateRow\` and \`DurationRow\` one to a row |
| \`TaskTooltip.FieldRows\`, \`TaskTooltip.FieldRow\` | Rows of any column, by \`columnName\` |
| \`TaskTooltip.Renderer\` | The default tooltip, to use as a part |

The tooltip follows the pointer and lets clicks through to the chart, so it can name a gesture, but it cannot hold a button.

{{story: A tooltip of your own}}

## Content on the bars

A Gantt module's \`hooks.chartConfig\` hands you DHTMLX's chart before it is drawn, and with it the chart's <a href="https://docs.dhtmlx.com/gantt/desktop__templates.html" target="_blank" rel="noreferrer">templates</a>: \`task_text\` inside a bar, \`rightside_text\` and \`leftside_text\` beside it, and \`link_class\` for a link. A \`task\` hook on the \`tasks\` service sets what each task carries, such as a milestone's \`color\` or a field the templates read, and a \`taskClass\` hook names bars for \`theme.hooks.styles\` to style. The example writes progress in the bars, flags critical work and names the milestones, and picks out the chain of tasks around the selected one.

{{story: Content on the bars}}

The library sets the chart's layout, scales and the other config it needs before your hook runs, so leave those to it.

## Every slot

| Component | Key | Slots |
|---|---|---|
| \`TaskGrid\` | \`treeCell\` | A cell's keys, as on [**Custom cells**](?path=/docs/controls-grid-appearance-custom-cells--overview), plus \`indent\` (\`onRender\`) and \`toggle\` (\`onRender\`, \`onRenderButton\`) |
| | \`percentComplete\` | A cell's keys, plus \`progress\` (\`onRender\`) |
| | \`expansionHeader\` | \`expandCollapse\` (\`onRender\`, \`onRenderExpandButton\`, \`onRenderCollapseButton\`) |
| | \`taskCommands\` | An empty cell's keys, for the **+** and a row's other commands |
| | \`overlays\`, \`rows\` | The Grid's, as on [**Overlays and rows**](?path=/docs/controls-grid-appearance-overlays-and-rows--overview) |
| \`TaskDatasetControl.Settings\` | Top level | \`onRender\`, \`onRenderButton\` |
| \`TaskGantt\` | \`chart\` | \`onRender\`, \`onRenderChart\`, which has to pass on its \`ref\` |
| | \`overlay\` | \`onRender\` |
| | \`skeleton\` | \`onRender\`, \`onRenderSkeleton\` |
| \`TaskGantt.Split\` | Top level | \`onRender\`, \`onRenderGridPane\`, \`onRenderGanttPane\`, \`onRenderHandle\` |
| \`TaskGantt.ZoomSlider\` | Top level | \`onRender\`, \`onRenderSlider\`, \`onRenderZoomButton\` |
| Checklist module | \`progress\` | \`onRender\`, \`onRenderIcon\`, \`onRenderText\` |
| Dependencies module | \`count\` | \`onRender\`, \`onRenderIcon\`, \`onRenderArrow\`, \`onRenderCount\` |
| Lookup-many module | \`cell\` | \`onRenderPill\` |
| | \`editor\` | \`onRender\`, \`onRenderPill\`, \`onRenderOption\` |
| | \`editorPopup\` | \`onRender\` |
| | \`filter\` | \`onRenderContainer\`, \`onRenderValue\`, \`onRenderButtons\`, \`onRenderApplyButton\`, \`onRenderClearButton\`; \`callout\` and \`select\` |
| Templates module | \`selector\` | \`onRender\` |
| | \`list\` | \`onRenderRecord\` |
| Task drawing module | \`preview\` | \`onRenderRow\`, \`onRenderSpan\`, \`onRenderCallout\`, \`onRenderText\` |
| Markers module | \`chip\` | \`onRender\`, \`onRenderChip\`; \`useMarker()\` returns the \`marker\` and its \`left\` |
| | \`line\`, \`scale\`, \`track\`, \`column\`, \`layer\` | \`onRender\` |
| Non-working days module | \`tooltip\` | \`onRender\`, \`onRenderContainer\`, \`onRenderDescription\` |
| Tooltip module | \`onRender\` | The whole tooltip, as above |
| | \`callout\` | \`onRender\`, \`onRenderContainer\` |
| | \`header\` | \`header\`, \`headerStart\`, \`headerEnd\`, \`title\` (\`onRender\`); \`status\` (\`onRender\`, \`onRenderLabel\`) |
| | \`progress\` | \`onRender\`, \`onRenderTrack\`, \`onRenderFill\`, \`onRenderText\` |
| | \`dateRange\` | \`onRender\`, \`onRenderIcon\`, \`onRenderRange\`, \`onRenderDuration\` |
| Links module | \`tooltip.onRender\` | A link's whole tooltip, of \`LinkTooltip\`'s parts; \`useLinkTooltip()\` returns the \`dependency\` and its \`predecessor\` and \`successor\` |
| | \`tooltip.callout\` | \`onRender\`, \`onRenderContainer\` |
| | \`tooltip.header\` | \`header\`, \`headerStart\`, \`title\` (\`onRender\`) |
| | \`tooltip.fieldRows\` | \`onRender\` |
| | \`tooltip.predecessor\`, \`tooltip.successor\` | \`onRender\`, \`onRenderIcon\`, \`onRenderLabel\`, \`onRenderValue\` |
| | \`tooltip.dateRange\` | \`onRender\`, \`onRenderIcon\`, \`onRenderRange\`, \`onRenderDuration\` |

A module's \`components\` go in its factory's parameters and are read at mount. In a tooltip of your own, each part takes its slots as its own \`components\`, and \`FieldRow\`, \`StartDateRow\`, \`EndDateRow\` and \`DurationRow\` take \`onRender\`, \`onRenderIcon\`, \`onRenderLabel\` and \`onRenderValue\`. \`TaskDatasetControl.Ribbon\` and \`TaskDatasetControl.PageSizeSwitcher\` take the DatasetControl's: see [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview). To change the task grid's strings, see [**Localization**](?path=/docs/concepts-localization--overview).

## Where next

**Next:** [**From your code**](?path=/docs/controls-taskgrid-guide-from-your-code--overview), to create and move tasks and write modules of your own.
`

const meta = {
    title: 'Controls/TaskGrid/Guide/Make it yours',
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

export const StatusDrivenRows: Story = {
    name: 'Status-driven rows',
    render: () => renderStory(<StatusDrivenRowsExample />),
}

export const PeopleInCells: Story = {
    name: 'People in cells',
    render: () => renderStory(<PeopleInCellsExample />),
    parameters: {
        docs: {
            description: {
                story: `Each task's team as chips with a picture and a first name, the ones that do not fit counted in **+N**. Try: point at the **+N** of *Website Redesign*.`,
            },
        },
    },
}

export const ATooltipOfYourOwn: Story = {
    name: 'A tooltip of your own',
    render: () => renderStory(<OwnTooltipExample />),
    parameters: {
        docs: {
            description: {
                story: `A tooltip with the task's owner and its dependencies, beside the library's header, progress and dates. Try: rest the pointer on a bar, then double-click it.`,
            },
        },
    },
}

export const ContentOnTheBars: Story = {
    name: 'Content on the bars',
    render: () => renderStory(<BarContentExample />),
    parameters: {
        docs: {
            description: {
                story: `Progress inside the bars, a flag beside critical work, named milestones, and the chain of tasks around the selected one. Try: click the bar of *Build the site*, then of *Map the redirects*.`,
            },
        },
    },
}
