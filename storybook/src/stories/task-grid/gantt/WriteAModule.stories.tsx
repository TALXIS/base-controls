import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { GanttOwnModuleExample } from '../../../task-grid/examples/ganttExamples'
import { ILifecycleStep, Lifecycle } from '../../../grid/showcase/Lifecycle'

const DESCRIPTION = `
When the built-in modules do not cover what you need, such as drawing critical tasks red or labelling the scale by your fiscal year, you write a module of your own. A module is a small object the Gantt loads on every mount: it hooks into the chart's config, styles and drawing, and reaches the task grid's runtime. Try it below: make a task critical in the grid's *Priority* column.

{{canvas: Colour bars and relabel the scale}}

## A module

A Gantt module is an object with a \`name\`, an \`onLoad\` that may be async, and an optional \`onDestroy(instance)\`. What \`onLoad\` returns is the module's instance, which the rest of your code reaches by the module's name. To type a module as an \`IGanttModule\`, as the example does, add its name and instance to \`IGanttModuleMap\` by augmenting \`@talxis/base-controls/gantt\`.

## Lifecycle

{{block: lifecycle}}

When a module's \`onLoad\` throws, the error shows in place of the control's parts, with *Try again*.

## What onLoad gets

| Member | Description |
|---|---|
| \`services\` | The Gantt's parts by key, with \`get\`, \`find\` and \`observe\`. See below. |
| \`modules\` | The other modules, by name, with \`get\`, \`find\` and \`observe\`. |
| \`events\` | \`onChartReady(chart)\`, \`onTasksParsed(isFirstLoad)\` and \`onDestroyed\`. |
| \`surfaces.hooks.surfaces.add(hook)\` | Draws React content over the chart: \`surfaces => surfaces.push({ key, onRender })\`. |
| \`theme.hooks.styles.add(hook)\` | Adds Fluent styles to the chart: \`(result, theme) => result.styles.push(...)\`. |
| \`hooks.chartConfig.add(hook)\` | Sets DHTMLX's config, templates and plugins before the chart is drawn: \`chart => chart.config.min_column_width = 80\`. |
| \`getTaskRuntime()\` | The task grid's runtime. See [**Talking to the task grid**](?path=/docs/controls-taskgrid-talking-to-the-task-grid--overview). |
| \`getLibrary()\` | \`{ Gantt, isPro }\`, the DHTMLX build. |
| \`getProps()\`, \`getLabels(set)\`, \`render()\` | The \`TaskGantt\`'s props, a label set's strings, and a redraw after a hook's answer changed. |

Every \`hooks.<thing>.add\` returns the function that removes the hook, and takes an optional \`priority\`: a higher number runs later.

## Services

\`taskRuntime\`, \`schedule\`, \`theme\`, \`overlay\`, \`state\` and \`labels\` are there from the start. The rest come once the chart is drawn, so reach them with \`services.observe(key, callback)\`.

| Key | Hooks and members |
|---|---|
| \`tasks\` | \`hooks.task.add((task, { record }) => …)\` changes a bar, such as its \`color\`, \`type\` or \`readonly\`. \`hooks.taskClass\` and \`hooks.rowClass\` add class names to a bar or its row. |
| \`zooming\` | \`hooks.scaleLabel.add((result, { date, unit, step, row }) => …)\` changes a scale cell's label. \`zoomToFit()\`, \`showTask(record)\`, \`getPixelsPerDay()\`. |
| \`timeline\` | \`hooks.cellClass\` and \`hooks.scaleCellClass\` add class names to a day's column or scale cell, by \`date\`. \`jumpToToday()\`. |
| \`schedule\` | \`hooks.duration.add((result, …) => …)\` changes how a duration is counted. \`hooks.snap.add((result, …) => …)\` changes where a dragged or drawn bar lands. |
| \`overlay\` | \`show(key)\` and \`hide(key)\` cover the chart with the loading overlay. |
| \`dragging\` | \`disableDragging()\` stops bar dragging until the function it returns is called. |
| \`chart\` | DHTMLX's own \`GanttStatic\`, for what no hook covers. |
| \`grid\` | The \`TaskGrid\`'s \`IGrid\`. |

## Inside what the Gantt draws

Content you draw over the chart, a marker slot or a tooltip part reads the Gantt with \`useGantt()\`, a service with \`useGanttService(key)\`, and a module with \`useGanttModule(name)\`. A service that comes with the chart is \`undefined\` until it does, and the component renders again when it arrives.

## From outside

\`taskRuntime.services.get('datasetControl').parts.find('gantt')\` returns the Gantt while one is drawn, with the same members as above.

## Where next

{{block: explore}}
`

const LIFECYCLE: ILifecycleStep[] = [
    { title: 'The modules load', hook: 'onLoad', text: 'The modules load by `priority`, the library first; modules of the same priority load at the same time, and each is registered under its name.' },
    { title: 'The chart is set up', hook: 'hooks.chartConfig', text: 'Once the task grid\'s AG Grid is ready, the chart config hooks run on DHTMLX\'s chart before it is drawn.' },
    { title: 'The chart services arrive', hook: 'services.observe', text: '`chart`, `timeline`, `dragging`, `zooming`, `grid` and `tasks` register, so their observers run.' },
    { title: 'The tasks are drawn', hook: 'onTasksParsed', text: 'The chart draws the grid\'s rows as bars and fires `onTasksParsed(true)`, and `false` each time it redraws them.' },
    { title: 'The chart is ready', hook: 'onChartReady', text: '`onChartReady` fires with the chart, and what the modules registered with `hooks.surfaces` is drawn over it.' },
    { title: 'The Gantt unmounts', hook: 'onDestroy', text: '`events` fires `onDestroyed`, then each module\'s `onDestroy`, the last loaded first, gets what its `onLoad` returned, and the chart is destroyed.' },
]

const EXPLORE: IExploreCard[] = [
    { title: 'Modules', iconName: 'Puzzle', href: '?path=/docs/controls-taskgrid-gantt-modules--overview', text: 'The built-in Gantt modules, and the library module every Gantt needs.' },
    { title: 'Talking to the task grid', iconName: 'Plug', href: '?path=/docs/controls-taskgrid-talking-to-the-task-grid--overview', text: 'What the task runtime a module reaches can do.' },
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

export const ColourBarsAndRelabelTheScale: Story = {
    name: 'Colour bars and relabel the scale',
    render: () => renderStory(<GanttOwnModuleExample />),
}
