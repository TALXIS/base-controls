import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { ILifecycleStep, Lifecycle } from '../../../grid/showcase/Lifecycle'
import { GanttCellClassExample, GanttChartConfigExample, GanttClassHookExample, GanttOwnModuleExample, GanttSnapHookExample, GanttSurfaceExample } from '../../../task-grid/examples/ganttExamples'

const DESCRIPTION = `
When the built-in modules do not cover what you need, such as colouring bars by status or shading your sprint reviews, you write a module of your own. A module is a small object the Gantt loads on every mount: it adds hooks that change how the tasks, the scale and the timeline are drawn, and it can draw popups of its own over the chart. Try it below: change a task's *Status* in the grid.

{{canvas: Colour bars by status}}

## A module

A Gantt module is an \`IGanttModule\` from \`@talxis/base-controls/gantt\`, passed to \`TaskGantt\`'s \`modules\` with the others.

| Member | Description |
|---|---|
| \`name\` | Unique among the Gantt's modules. The module is reached by it. |
| \`onLoad(gantt, { signal })\` | Runs on every mount, before the chart is drawn, and may be async. What it returns is the module. \`signal\` aborts when the mount goes or another module fails. |
| \`priority\` | Lower loads first, and modules of the same priority load at the same time. \`0\` by default; the library module's is \`-100\`. |
| \`onDestroy(module)\` | Runs as the mount goes, with what \`onLoad\` returned. |

Add each module's name, and what its \`onLoad\` returns, to \`IGanttModuleMap\` by augmenting \`@talxis/base-controls/gantt\`, as the example's *types.ts* does. \`IGanttModule\` then takes the name, and \`modules.get(name)\` returns the module's type. When \`onLoad\` throws, the error shows in place of the whole control, with *Try again* to mount it again.

## Lifecycle

{{block: lifecycle}}

## What onLoad gets

| Member | Description |
|---|---|
| \`services\` | The Gantt's services by key, with \`get\`, \`find\` and \`observe\`. See *Services* below. |
| \`modules\` | The other modules by name, with \`get\`, \`find\` and \`observe\`. |
| \`hooks.chartConfig\` | Sets DHTMLX's config, templates and plugins before the chart is drawn. |
| \`theme.hooks.styles\` | Adds Fluent styles to the chart. See *Class names and styles* below. |
| \`surfaces.hooks.surfaces\` | Draws content of your own over the chart. See *Surfaces* below. |
| \`events\` | \`onChartReady(chart)\`, \`onTasksParsed(isFirstLoad)\` and \`onDestroyed\`. |
| \`getTaskRuntime()\` | The task grid's runtime: see [**Talking to the task grid**](?path=/docs/controls-taskgrid-talking-to-the-task-grid--overview). |
| \`getLibrary()\` | \`{ Gantt, isPro }\`: the DHTMLX build, as under *The library* on [**Modules**](?path=/docs/controls-taskgrid-gantt-modules--overview). |
| \`getProps()\`, \`getLabels(set)\`, \`render()\` | The \`TaskGantt\`'s props, a label set's strings, and a redraw of the chart. |

## Services

\`taskRuntime\`, \`schedule\`, \`theme\`, \`overlay\`, \`state\` and \`labels\` are there from the start. The others come with the chart, so reach them with \`services.observe(key, callback)\`: the callback runs once the service is there, and what it returns runs when the service goes, so return the remover of the hooks you add, as the examples do.

| Key | Holds |
|---|---|
| \`taskRuntime\` | The task grid's runtime, which \`getTaskRuntime()\` returns too. |
| \`schedule\` | How a task's dates map to its bar. Its members are under *Reference* on [**Dates and bars**](?path=/docs/controls-taskgrid-gantt-dates-and-bars--overview). |
| \`theme\`, \`overlay\`, \`state\`, \`labels\` | The chart's styles; \`show(key)\` and \`hide(key)\` of the cover over the chart; the Gantt's own state, kept under its \`stateKey\`; and \`getLabels(set)\`. |
| \`chart\` | DHTMLX's own \`GanttStatic\`, for what no hook covers. |
| \`tasks\` | The chart's tasks: \`getRecord(taskId)\`, \`getTaskIds()\`, \`isLocked(taskId)\`, \`isSaving(taskId)\`, and \`parse()\`, which builds every task anew. |
| \`zooming\` | The zoom. Its members are under *Reference* on [**Zoom and navigation**](?path=/docs/controls-taskgrid-gantt-zoom-and-navigation--overview). |
| \`timeline\` | The dates the chart draws: \`jumpToToday()\` and \`getViewportWidth()\`. |
| \`dragging\` | \`events\` of a dragged bar: \`onDragStarted(taskId)\`, \`onDragEnded\` and \`onDraggingDisabledChanged\`. \`disableDragging()\` keeps bars still until the function it returns is called. |
| \`grid\` | The \`TaskGrid\`'s \`IGrid\`: see [**Talking to the grid**](?path=/docs/controls-grid-talking-to-the-grid--overview). |

## Hooks

| Hook | Gets | Changes |
|---|---|---|
| \`gantt.hooks.chartConfig\` | \`(chart)\` | DHTMLX's config, templates and plugins, before the chart is drawn. |
| \`tasks.hooks.task\` | \`(task, { record })\` | DHTMLX's task for a record, such as its \`color\`, \`progressColor\`, \`type\` or \`readonly\`. |
| \`tasks.hooks.taskClass\`, \`rowClass\` | \`(classNames, { record, task })\` | The class names of a bar, or of its row. |
| \`timeline.hooks.cellClass\`, \`scaleCellClass\` | \`(classNames, { date })\` | The class names of a cell of the timeline, or of the scale. |
| \`zooming.hooks.scaleLabel\` | \`(result, { date, unit, step, row })\` | \`result.label\`, as on [**Zoom and navigation**](?path=/docs/controls-taskgrid-gantt-zoom-and-navigation--overview). |
| \`schedule.hooks.snap\` | \`(result, { change, original })\` | \`result.span\`, where a dragged or drawn bar lands. |
| \`schedule.hooks.duration\` | \`(result, { span, record })\` | \`result.duration\`, the clock minutes of a span before a day is cut to \`hoursPerDay\`. |
| \`theme.hooks.styles\` | \`(result, theme)\` | \`result.styles\`, the Fluent styles of the chart. |
| \`surfaces.hooks.surfaces\` | \`(surfaces)\` | What is drawn over the chart. |

Every \`add\` returns the function that removes the hook, and takes an optional \`priority\`: a higher number runs later. A task's hooks run again when its record changes; after something else a hook reads changes, call \`tasks.parse()\` or \`gantt.render()\`.

### Class names and styles

A class hook names what to style, and \`theme.hooks.styles\` adds the style. Styles nest under the chart, so a class name counts only inside it.

{{story: Ring the critical tasks}}

### DHTMLX's own config

\`hooks.chartConfig\` gets DHTMLX's chart before it is drawn, for its config, templates and plugins: see the <a href="https://docs.dhtmlx.com/gantt/api__refs__gantt.html" target="_blank" rel="noreferrer">DHTMLX Gantt API</a>. The Gantt sets the config it needs first, so leave the layout, the grid and the scales to it.

{{story: Progress beside the bars}}

### The timeline's cells

\`cellClass\` and \`scaleCellClass\` name the cells of the dates you pick, such as days of your own, for a style to shade them.

{{story: Shade the sprint reviews}}

### Where bars land

A \`snap\` hook gets the span after the Gantt has snapped it to the scale, and \`change\`: \`'move'\` for a moved bar, \`'start'\` or \`'end'\` for a dragged edge, or \`'span'\` for a drawn task. The [**Non-working days**](?path=/docs/controls-taskgrid-gantt-modules-non-working-days--overview) module keeps bars off non-working days with one.

{{story: Start on a Monday}}

## Surfaces

A surface is content a module draws over the chart, such as a popup or a menu. Add it in \`onLoad\` with \`surfaces.hooks.surfaces.add(surfaces => surfaces.push({ key, onRender }))\`; it is drawn once the chart is. Return a component of your own from \`onRender\`, so it can hold state and use hooks.

Inside what the Gantt draws, a surface, a marker slot or a tooltip part, \`useGantt()\` returns the Gantt, \`useGanttService(key)\` a service, and \`useGanttModule(name)\` a module. A service that comes with the chart is \`undefined\` until it does, and the component renders again when it arrives.

{{story: A menu on right-click}}

## From outside

Outside the Gantt, the DatasetControl's \`parts.find('gantt')\` returns the Gantt while one is drawn, with the members above, as *Zoom from your code* on [**Zoom and navigation**](?path=/docs/controls-taskgrid-gantt-zoom-and-navigation--overview) does. From the task runtime, that is \`taskRuntime.services.get('datasetControl').parts.find('gantt')\`.

## Where next

{{block: explore}}
`

const LIFECYCLE: ILifecycleStep[] = [
    { title: 'The modules load', hook: 'onLoad', text: 'The modules load by `priority`, the library first; modules of the same priority load at the same time, and each is provided under its name.' },
    { title: 'The chart is set up', hook: 'hooks.chartConfig', text: 'Once the task grid has drawn, the chart config hooks run on DHTMLX\'s chart before it is drawn.' },
    { title: 'The chart services arrive', hook: 'services.observe', text: '`chart`, `timeline`, `dragging`, `zooming`, `grid` and `tasks` are provided, so their observers run.' },
    { title: 'The tasks are drawn', hook: 'onTasksParsed', text: 'The chart draws the grid\'s rows and fires `onTasksParsed(true)`, and `false` each time it builds them anew.' },
    { title: 'The chart is ready', hook: 'onChartReady', text: '`onChartReady` fires with the chart, and the surfaces are drawn over it.' },
    { title: 'The Gantt unmounts', hook: 'onDestroy', text: '`onDestroyed` fires, then each module\'s `onDestroy`, the last loaded first, gets what its `onLoad` returned, and the chart is destroyed.' },
]

const EXPLORE: IExploreCard[] = [
    { title: 'Modules', iconName: 'Puzzle', href: '?path=/docs/controls-taskgrid-gantt-modules--overview', text: 'The built-in Gantt modules, and the library module every Gantt needs.' },
    { title: 'Talking to the task grid', iconName: 'Plug', href: '?path=/docs/controls-taskgrid-talking-to-the-task-grid--overview', text: 'What the task runtime a module reaches can do.' },
    { title: 'Dates and bars', iconName: 'CalendarSettings', href: '?path=/docs/controls-taskgrid-gantt-dates-and-bars--overview', text: 'The schedule service, and how a task\'s dates make its bar.' },
]

const meta = {
    title: 'Controls/TaskGrid/Gantt/Write a module',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { lifecycle: () => <Lifecycle steps={LIFECYCLE} />, explore: () => <ExploreCards cards={EXPLORE} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ColourBarsByStatus: Story = {
    name: 'Colour bars by status',
    render: () => renderStory(<GanttOwnModuleExample />),
}

export const RingTheCriticalTasks: Story = {
    name: 'Ring the critical tasks',
    render: () => renderStory(<GanttClassHookExample />),
    parameters: {
        docs: {
            description: {
                story: `A class name on the bars of critical tasks, and a ring for the class. Try: set a task's *Priority* to *Critical* in the grid.`,
            },
        },
    },
}

export const ProgressBesideTheBars: Story = {
    name: 'Progress beside the bars',
    render: () => renderStory(<GanttChartConfigExample />),
    parameters: {
        docs: {
            description: {
                story: `A DHTMLX template that writes each task's progress to the right of its bar. Try: change a task's *% Complete* in the grid.`,
            },
        },
    },
}

export const ShadeTheSprintReviews: Story = {
    name: 'Shade the sprint reviews',
    render: () => renderStory(<GanttCellClassExample />),
    parameters: {
        docs: {
            description: {
                story: `Every other Friday shaded on the timeline and on its scale. Try: zoom in until the scale shows days.`,
            },
        },
    },
}

export const StartOnAMonday: Story = {
    name: 'Start on a Monday',
    render: () => renderStory(<GanttSnapHookExample />),
    parameters: {
        docs: {
            description: {
                story: `A snap hook that moves every moved or drawn bar to start on the nearest Monday. Try: drag a bar a few days later.`,
            },
        },
    },
}

export const AMenuOnRightClick: Story = {
    name: 'A menu on right-click',
    render: () => renderStory(<GanttSurfaceExample />),
    parameters: {
        docs: {
            description: {
                story: `A surface that opens a menu for the bar the user right-clicks. Try: right-click a bar and pick *Show on timeline*.`,
            },
        },
    },
}
