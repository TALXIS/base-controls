import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { GanttOwnModuleExample } from '../../../task-grid/examples/ganttExamples'

const DESCRIPTION = `
A Gantt module is an object with a \`name\` and an \`onLoad\`. The Gantt calls \`onLoad\` on every mount, in the order of \`modules\`, before the chart is drawn, and registers what it returns under the name.

\`\`\`tsx
const criticalTasksModule = {
    name: 'criticalTasks',
    onLoad: gantt => {
        gantt.services.observe('tasks', tasks => tasks.registerTask((task, { record }) => {
            if (record.getValue('priority') === CRITICAL) {
                task.color = '#d13438'
            }
        }))
        return {}
    },
}

const ganttModules = [createLibraryModule(), criticalTasksModule]
\`\`\`

\`name\` must be unique, \`onLoad\` may be async, and \`onDestroy(instance)\` gets what \`onLoad\` returned as the Gantt unmounts. To type a module as an \`IGanttModule\`, add its name to \`IGanttModuleMap\` through module augmentation.

{{story: Colour bars and relabel the scale}}

## What onLoad gets

| Member | Description |
|---|---|
| \`services\` | The Gantt's parts by key, with \`get\`, \`find\` and \`observe\`. See below. |
| \`modules\` | The other modules, by name, with \`get\`, \`find\` and \`observe\`. |
| \`events\` | \`onChartReady(chart)\`, \`onTasksParsed(isFirstLoad)\` and \`onDestroyed\`. |
| \`surfaces.registerSurface(hook)\` | Draws React content over the chart: \`surfaces => surfaces.push({ key, onRender })\`. |
| \`theme.registerStyles(hook)\` | Adds Fluent styles to the chart: \`(result, theme) => result.styles.push(...)\`. |
| \`registerChartConfig(hook)\` | Sets DHTMLX's config, templates and plugins before the chart is drawn: \`chart => chart.config.min_column_width = 80\`. |
| \`getTaskRuntime()\` | The task grid's runtime. See [**Talking to the task grid**](?path=/docs/taskgrid-talking-to-the-task-grid--overview). |
| \`getLibrary()\` | \`{ Gantt, isPro }\`, the DHTMLX build. |
| \`getProps()\`, \`getLabels(set)\`, \`render()\` | The \`TaskGantt\`'s props, a label set's strings, and a redraw after a hook's answer changed. |

Every \`register…\` returns the function that unregisters it, and takes an optional \`priority\`: a higher number gets the later word.

## Services

\`taskRuntime\`, \`schedule\`, \`theme\`, \`overlay\`, \`state\` and \`localization\` are there from the start. The rest come once the chart is drawn, so reach them with \`services.observe(key, callback)\`:

| Key | Hooks and members |
|---|---|
| \`tasks\` | \`registerTask((task, { record }) => …)\` changes a bar, such as its \`color\`, \`type\` or \`readonly\`. \`registerTaskClass\` and \`registerRowClass\` add class names to a bar or its row. |
| \`zooming\` | \`registerScaleLabel((result, { date, unit, step, row }) => …)\` changes a scale cell's label. \`zoomToFit()\`, \`showTask(record)\`, \`getPixelsPerDay()\`. |
| \`timeline\` | \`registerCellClass\` and \`registerScaleCellClass\` add class names to a day's column or scale cell, by \`date\`. \`jumpToToday()\`. |
| \`schedule\` | \`registerDuration((result, …) => …)\` changes how a duration is counted. \`registerSnap((result, …) => …)\` changes where a dragged or drawn bar lands. |
| \`overlay\` | \`show(key)\` and \`hide(key)\` cover the chart with the loading overlay. |
| \`dragging\` | \`disableDragging()\` stops bar dragging until the function it returns is called. |
| \`chart\` | DHTMLX's own \`GanttStatic\`, for what no hook covers. |
| \`grid\` | The \`TaskGrid\`'s \`IGrid\`. |

## Inside what the Gantt draws

A surface, a marker slot or a tooltip part reads the Gantt with \`useGantt()\`, a service with \`useGanttService(key)\`, and a module with \`useGanttModule(name)\`. A service that comes with the chart is \`undefined\` until it does, and the component renders again when it arrives.

## From outside

\`taskRuntime.services.get('datasetControl').parts.find('gantt')\` returns the Gantt while one is drawn, with the same members as above.
`

const meta = {
    title: 'TaskGrid/Gantt/Write a module',
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

export const ColourBarsAndRelabelTheScale: Story = {
    name: 'Colour bars and relabel the scale',
    render: () => renderStory(<GanttOwnModuleExample />),
    parameters: {
        docs: {
            description: {
                story: `Two modules of a few lines each: critical tasks drawn red, and quarters labelled by a fiscal year that starts in July. Try: zoom out until the scale shows quarters, or make a task critical in the grid's *Priority* column.`,
            },
        },
    },
}
