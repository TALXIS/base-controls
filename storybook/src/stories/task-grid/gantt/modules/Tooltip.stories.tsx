import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GanttTooltipExample } from '../../../../task-grid/examples/ganttExamples'

const DESCRIPTION = `
The tooltip module shows what a bar is about when the pointer rests on it: by default the task's name and status, its progress, and when it runs. While a bar is dragged, the tooltip follows it with the dates it would get.

\`\`\`tsx
const ganttModules = React.useMemo(() => [createLibraryModule(), createTaskTooltipModule({ statusColumnName: 'statuscode' })], [])
\`\`\`

| Option | Description |
|---|---|
| \`statusColumnName\` | An option set column, shown in the header as a pill in its option's colour. |
| \`onRender\` | The whole tooltip, composed from \`TaskTooltip\`'s parts. See below. |
| \`components\` | Pieces of the default tooltip; not read with \`onRender\`. See *Changing how it looks* below. |

## Compose your own

\`onRender\` returns a \`TaskTooltip\` with the parts you want, in your order:

\`\`\`tsx
createTaskTooltipModule({
    statusColumnName: 'statuscode',
    onRender: () => <TaskTooltip>
        <TaskTooltip.Callout>
            <TaskTooltip.Header />
            <TaskTooltip.FieldRows>
                <TaskTooltip.FieldRow columnName='priority' iconName='Flag' />
            </TaskTooltip.FieldRows>
            <TaskTooltip.DateRangeRow />
        </TaskTooltip.Callout>
    </TaskTooltip>,
})
\`\`\`

{{story: Compose the tooltip}}

| Part | Description |
|---|---|
| \`TaskTooltip.Callout\` | The callout beside the bar. Holds the rest. |
| \`TaskTooltip.Header\` | The task's name, and its status with \`statusColumnName\`. |
| \`TaskTooltip.ProgressRow\` | \`percentComplete\` as a bar. Nothing when it is not mapped or empty. |
| \`TaskTooltip.DateRangeRow\` | The start, end and duration on one line. |
| \`TaskTooltip.StartDateRow\`, \`EndDateRow\`, \`DurationRow\` | The same, one per row. |
| \`TaskTooltip.FieldRows\` | Holds field rows. |
| \`TaskTooltip.FieldRow\` | Any column of the task, by \`columnName\`, with an optional \`iconName\`. Nothing while the value is empty. |
| \`TaskTooltip.Renderer\` | The default tooltip, to use as a part. |

The date rows show the dates as the timeline draws them, so they follow a bar while it is dragged.

## Changing how it looks

\`createTaskTooltipModule\` takes \`components\` for the default tooltip, read at mount, and \`TaskTooltip.Renderer\` takes the same keys. In a tooltip of your own, each part takes its own slots as \`components\`. How slots work is under *Changing how it looks* on [**Grid › Appearance**](?path=/docs/controls-grid-appearance--overview).

| Key | Part | Slots | Default | Draws |
|---|---|---|---|---|
| \`callout\` | \`TaskTooltip.Callout\` | \`onRenderCallout\`, \`onRenderContainer\` | \`TooltipUiCalloutComponents\` | The callout beside the bar |
| \`header\` | \`TaskTooltip.Header\` | \`onRenderContainer\`, \`onRenderTitle\`; \`status\` | \`TooltipUiHeaderComponents\` | The name and the status pill |
| \`progress\` | \`TaskTooltip.ProgressRow\` | \`onRenderContainer\`, \`onRenderTrack\`, \`onRenderFill\`, \`onRenderText\` | \`TooltipUiProgressComponents\` | The progress bar |
| \`dateRange\` | \`TaskTooltip.DateRangeRow\` | \`onRenderContainer\`, \`onRenderIcon\`, \`onRenderRange\`, \`onRenderDuration\` | \`TooltipUiDateRangeComponents\` | The dates and the duration |
| | \`TaskTooltip.FieldRows\` | \`onRenderContainer\` | \`TooltipUiFieldRowsComponents\` | The box the field rows sit in |
| | \`TaskTooltip.FieldRow\`, \`StartDateRow\`, \`EndDateRow\`, \`DurationRow\` | \`onRenderContainer\`, \`onRenderIcon\`, \`onRenderLabel\`, \`onRenderValue\` | \`TooltipUiFieldRowComponents\` | One row of the tooltip |
`

const meta = {
    title: 'Controls/TaskGrid/Gantt/Modules/Tooltip',
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

export const ComposeTheTooltip: Story = {
    name: 'Compose the tooltip',
    render: () => renderStory(<GanttTooltipExample />),
    parameters: {
        docs: {
            description: {
                story: `A tooltip with the status, progress, priority, effort and dates. Try: rest the pointer on a bar, then drag it and watch the dates follow. In **Code**, add a \`FieldRow\` for \`description\`.`,
            },
        },
    },
}
