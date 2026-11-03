import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GanttLinksExample } from '../../../../task-grid/examples/ganttExamples'

const DESCRIPTION = `
The links module draws the task grid's dependencies as arrows between the bars, and lets the user draw and delete them. The dependencies come from the [**Dependencies**](?path=/docs/controls-taskgrid-modules-dependencies--overview) module, which keeps them in memory, in Dataverse or in TALXIS: without it, the links module draws nothing.

\`\`\`tsx
const controlModules = React.useMemo(() => [createMemoryDependenciesModule({ dependencies: DEPENDENCIES })], [])
const ganttModules = React.useMemo(() => [createLibraryModule(), createLinksModule()], [])

<TaskDatasetControl modules={controlModules} enableEditing onLoad={loadTasks}>
    <DatasetControl.Body>
        <TaskGantt.Split>
            <TaskGrid />
            <TaskGantt modules={ganttModules} />
        </TaskGantt.Split>
    </DatasetControl.Body>
</TaskDatasetControl>
\`\`\`

{{story: Link the tasks}}

## What the user can do

With \`enableEditing\`:

| To | The user |
|---|---|
| Draw a link | drags from the handle at either end of a bar to another bar. The ends it joins decide the type: *finish to start*, *start to start*, *finish to finish* or *start to finish*. A duplicate or a cycle is refused while drawing. |
| Delete a link | double-clicks it and confirms |
| See what it joins | points at it |

While a link saves, its tasks show as saving, and afterwards the store reads the tasks again, for dates the backend rescheduled.

## Options

| Option | Description |
|---|---|
| \`onRenderTooltip\` | A link's whole tooltip, composed from \`LinkTooltip\`'s parts: \`Callout\`, \`Header\`, \`FieldRows\`, \`PredecessorRow\`, \`SuccessorRow\` and \`DateRangeRow\`. |
| \`components\` | Pieces of the default link tooltip. See *Changing how it looks* below. |

## Changing how it looks

\`createLinksModule\` takes \`components\` for the default link tooltip, read at mount, under \`tooltip\`; the parts of \`LinkTooltip\` take the same slots as \`components\`. How slots work is under *Changing how it looks* on [**Grid › Appearance**](?path=/docs/controls-grid-appearance--overview).

| Key | Part | Slots | Default | Draws |
|---|---|---|---|---|
| \`tooltip.callout\` | \`LinkTooltip.Callout\` | \`onRenderCallout\`, \`onRenderContainer\` | \`TooltipUiCalloutComponents\` | The callout beside the link |
| \`tooltip.header\` | \`LinkTooltip.Header\` | \`onRenderContainer\`, \`onRenderTitle\` | \`TooltipUiHeaderComponents\` | The dependency's type |
| \`tooltip.fieldRows\` | \`LinkTooltip.FieldRows\` | \`onRenderContainer\` | \`TooltipUiFieldRowsComponents\` | The box the rows sit in |
| \`tooltip.predecessor\`, \`tooltip.successor\` | \`LinkTooltip.PredecessorRow\`, \`SuccessorRow\` | \`onRenderContainer\`, \`onRenderIcon\`, \`onRenderLabel\`, \`onRenderValue\` | \`TooltipUiFieldRowComponents\` | The two tasks |
| \`tooltip.dateRange\` | \`LinkTooltip.DateRangeRow\` | \`onRenderContainer\`, \`onRenderIcon\`, \`onRenderRange\`, \`onRenderDuration\` | \`TooltipUiDateRangeComponents\` | The dates the link joins |
`

const meta = {
    title: 'Controls/TaskGrid/Gantt/Modules/Links',
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

export const LinkTheTasks: Story = {
    name: 'Link the tasks',
    render: () => renderStory(<GanttLinksExample />),
    parameters: {
        docs: {
            description: {
                story: `The sample dependencies in memory. Try: drag from the end of one bar to the start of another, point at the new link, then double-click it to delete it.`,
            },
        },
    },
}
