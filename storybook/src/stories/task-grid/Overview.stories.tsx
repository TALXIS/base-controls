import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { GanttPlanExample } from '../../task-grid/guide/TheGanttExamples'

const DESCRIPTION = `
A task grid shows a plan as a tree of tasks, each under its parent and in its place among its siblings, and lets the user build the plan where they see it: add tasks, rename them, drag them about and delete them. A Gantt chart beside it draws the same tasks on a timeline, and each feature beyond the tree, such as dependencies, checklists or markers, is a module you add. Try it below: drag a bar a week later, then hold Ctrl and drag along an empty stretch of a row.

{{canvas: Overview}}

## What it is made of

| Part | Draws | Goes |
|---|---|---|
| \`TaskDatasetControl\` | The frame around the other parts, with its loading state and errors. It loads the tasks through the store \`onLoad\` returns, and its \`enable…\` props say what the user may change. | Around everything else. |
| \`TaskGrid\` | The tasks as a tree. It is a Grid, takes the Grid's props, and throws outside a \`TaskDatasetControl\`. | In \`DatasetControl.Body\`. |
| \`TaskGantt\` | The same tasks on a timeline, row for row with the grid. It comes from \`@talxis/base-controls/gantt\`. | Beside the \`TaskGrid\`, in \`TaskGantt.Split\`. |
| \`TaskDatasetControl.Ribbon\` | \`DatasetControl.Ribbon\` with *New*, *Edit* and *Delete* first. | In the header. |
| \`TaskDatasetControl.Settings\` | A menu of toggles: *Show hierarchy*, *Hide inactive tasks* and what the modules add. | In the header. |
| \`TaskDatasetControl.PageSizeSwitcher\` | How many tasks the tree shows. A task grid loads every task at once, so it has no pages. | In the footer. |

\`TaskDatasetControl\` is a DatasetControl whose records are tasks, so views, quick find, *Edit columns*, layout and state work as on [**DatasetControl**](?path=/docs/controls-datasetcontrol-get-started--overview), and columns, sorting, filtering and selection as on [**Grid**](?path=/docs/controls-grid-get-started--overview). \`TaskGrid\` edits cells with \`createTaskEditingModule()\` in place of the Grid's editing module, and leaves out grouping and totals.

## What you can add

| Module | The user gets |
|---|---|
| Project | The project the tasks belong to, with its dates on the timeline |
| Custom columns | Columns they add themselves |
| Lookup many | Several related records in one column, such as assignees or tags |
| Templates | Tasks planned from a template |
| Checklist | Each task's checklist progress |
| Dependencies | Tasks that wait on other tasks, drawn as links on the timeline |
| The Gantt's modules | Dragging and drawing bars, a tooltip, markers, non-working days and links |

Each task module comes for memory, Dataverse, TALXIS or a store of your own. The [**Guide**](?path=/docs/controls-taskgrid-guide-your-first-task-grid--overview) adds them one step at a time, and their factories and parameters are on [**Reference**](?path=/docs/controls-taskgrid-reference--overview).

## Changing how it looks

\`TaskGrid\`, the Gantt's components and the modules that draw something each take \`components\`; a module's go in its factory's parameters and are read at mount. How slots work is on [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Component | Key | Slots | Default | Draws |
|---|---|---|---|---|
| \`TaskGrid\` | \`treeCell\` | A cell's keys, as on [**Custom cells**](?path=/docs/controls-grid-appearance-custom-cells--overview), plus \`indent\` (\`onRender\`) and \`toggle\` (\`onRender\`, \`onRenderButton\`) | \`TaskGridUiTreeCellIndentComponents\`, \`GroupingUiToggleComponents\` | The subject cell, its indent and its chevron |
| | \`percentComplete\` | A cell's keys, plus \`progress\` (\`onRender\`) | \`TaskGridUiPercentCompleteComponents\` | The progress bar |
| | \`expansionHeader\` | \`expandCollapse\` (\`onRender\`, \`onRenderExpandButton\`, \`onRenderCollapseButton\`) | \`GroupingUiExpandCollapseComponents\` | The buttons that open and close a level |
| | \`taskCommands\` | An empty cell's keys | | The **+** and a row's other commands |
| | \`overlays\`, \`rows\` | The Grid's, as on [**Overlays and rows**](?path=/docs/controls-grid-appearance-overlays-and-rows--overview) | | |
| \`TaskDatasetControl.Settings\` | Top level | \`onRender\`, \`onRenderButton\` | \`TaskGridUiSettingsMenuComponents\` | The settings button and its menu |
| \`TaskGantt\` | \`chart\` | \`onRender\`, \`onRenderChart\` | \`GanttUiChartComponents\` | The chart's box; \`onRenderChart\` has to pass on its \`ref\` |
| | \`overlay\` | \`onRender\` | \`GanttUiOverlayComponents\` | The cover over the chart while the tasks load |
| | \`skeleton\` | \`onRender\`, \`onRenderSkeleton\` | \`GanttUiSkeletonComponents\` | The placeholder until the chart is drawn |
| \`TaskGantt.Split\` | Top level | \`onRender\`, \`onRenderGridPane\`, \`onRenderGanttPane\`, \`onRenderHandle\` | \`GridGanttUiSplitComponents\` | The two panes and the handle between them |
| \`TaskGantt.ZoomSlider\` | Top level | \`onRender\`, \`onRenderSlider\`, \`onRenderZoomButton\` | \`GanttUiZoomSliderComponents\` | The slider and its zoom buttons |
| Checklist module | \`progress\` | \`onRender\`, \`onRenderIcon\`, \`onRenderText\` | \`TaskChecklistUiProgressComponents\` | The *done/total* in a cell |
| Dependencies module | \`count\` | \`onRender\`, \`onRenderIcon\`, \`onRenderArrow\`, \`onRenderCount\` | \`DependenciesUiCountComponents\` | The count in a *Predecessors* or *Successors* cell |
| Lookup-many module | \`cell\` | \`onRenderPill\` | \`LookupManyUiPillsComponents\` | A record in a cell |
| | \`editor\` | \`onRender\`, \`onRenderPill\`, \`onRenderOption\` | \`LookupManyUiSelectComponents\` | The picker, a picked record and a record offered |
| | \`editorPopup\` | \`onRender\` | \`LookupManyUiEditorPopupComponents\` | The box the editor pops out in |
| | \`filter\` | \`onRenderContainer\`, \`onRenderValue\`, \`onRenderButtons\`, \`onRenderApplyButton\`, \`onRenderClearButton\`; \`callout\` and \`select\` | \`LookupManyUiFilterComponents\` | The column's filter |
| Templates module | \`selector\` | \`onRender\` | \`TemplatesUiRecordSelectorFrameComponents\` | The box the template picker is drawn in |
| | \`list\` | \`onRenderRecord\` | \`TemplatesUiRecordListComponents\` | A template in the picker |
| Task drawing module | \`preview\` | \`onRenderRow\`, \`onRenderSpan\`, \`onRenderCallout\`, \`onRenderText\` | \`TaskDrawingUiPreviewComponents\` | The row drawn on, the span and the callout with its dates |
| Markers module | \`chip\` | \`onRender\`, \`onRenderChip\` | \`MarkerUiChipComponents\` | The chip on the scale; \`useMarker()\` returns its \`marker\` and \`left\` |
| | \`line\`, \`scale\`, \`track\`, \`column\`, \`layer\` | \`onRender\` | \`MarkerUiLineComponents\` and the like | The line down the chart, and the boxes the chips and lines sit in |
| Non-working days module | \`tooltip\` | \`onRender\`, \`onRenderContainer\`, \`onRenderDescription\` | \`NonWorkingDaysUiTooltipComponents\` | The tooltip of a shaded day on the scale |
| Tooltip module | \`onRender\` | The whole tooltip, of \`TaskTooltip\`'s parts; \`useTaskTooltip()\` reads the task | \`TaskTooltip.Renderer\` | What a bar says under the pointer |
| | \`callout\` | \`onRender\`, \`onRenderContainer\` | \`TooltipUiCalloutComponents\` | The callout beside the pointer |
| | \`header\` | \`header\`, \`headerStart\`, \`headerEnd\`, \`title\` (\`onRender\`); \`status\` (\`onRender\`, \`onRenderLabel\`) | \`RecordCardHeaderComponents\` and the like | The name and the status pill |
| | \`progress\` | \`onRender\`, \`onRenderTrack\`, \`onRenderFill\`, \`onRenderText\` | \`RecordCardProgressComponents\` | The progress bar |
| | \`dateRange\` | \`onRender\`, \`onRenderIcon\`, \`onRenderRange\`, \`onRenderDuration\` | \`RecordCardDateRangeComponents\` | The dates and the duration |
| Links module | \`tooltip.onRender\` | A link's whole tooltip, of \`LinkTooltip\`'s parts; \`useLinkTooltip()\` reads the link | | What a link says under the pointer |
| | \`tooltip.callout\`, \`tooltip.header\`, \`tooltip.fieldRows\`, \`tooltip.predecessor\`, \`tooltip.successor\`, \`tooltip.dateRange\` | As the tooltip module's keys of the same kind | \`TooltipUiCalloutComponents\`, \`RecordCardFieldRowComponents\` and the like | The default link tooltip |

To change the task grid's and the Gantt's strings, see [**Localization**](?path=/docs/concepts-localization--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Your first task grid', iconName: 'Education', href: '?path=/docs/controls-taskgrid-guide-your-first-task-grid--overview', text: 'Start the guide: build a task grid step by step, one feature or module at a time.' },
    { title: 'Reference', iconName: 'Table', href: '?path=/docs/controls-taskgrid-reference--overview', text: 'Every prop, module parameter and runtime member.' },
]

const meta = {
    title: 'Controls/TaskGrid/Overview',
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

export const Overview: Story = {
    name: 'Overview',
    render: () => renderStory(<GanttPlanExample />),
}
