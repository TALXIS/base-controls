import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { CzechTaskGridExample } from '../../task-grid/examples/taskGridExamples'

const DESCRIPTION = `
Every string the task grid, its modules and the Gantt show is a label, replaced through \`LocalizationProvider\` like every other string in the library (see [**LocalizationProvider**](?path=/docs/providers-localizationprovider--overview)). This page lists the keys.

\`\`\`tsx
import { CZECH_LABELS, LocalizationProvider } from '@talxis/base-controls'

const labels = { ...CZECH_LABELS, 'taskGrid.addChild': 'Přidat podúkol' }

<LocalizationProvider labels={labels}>
    <TaskDatasetControl onLoad={loadTasks}>...</TaskDatasetControl>
</LocalizationProvider>
\`\`\`

{{story: Translate into Czech}}

## Task grid

| Key | Default |
|---|---|
| \`taskGrid.new\`, \`taskGrid.edit\`, \`taskGrid.delete\` | New, Edit, Delete |
| \`taskGrid.addChild\` | Add a subtask |
| \`taskGrid.settings\` | Settings |
| \`taskGrid.showHierarchy\`, \`taskGrid.hideInactiveTasks\` | Show hierarchy, Hide inactive tasks |
| \`taskGrid.expandLevel\`, \`taskGrid.collapseLevel\` | Expand one level, Collapse one level |
| \`taskGrid.path\` | Path |
| \`taskGrid.confirmDeleteTasks\` | Do you want to delete the selected tasks? |
| \`taskGrid.confirmDeleteTasksWithSubtasks\` | Do you want to delete the selected tasks and their {{ count }} subtasks? |
| \`taskGrid.tasksCannotBeDeleted\`, \`taskGrid.taskCannotBeDeleted\` | The selected tasks cannot be deleted., This task cannot be deleted. |
| \`taskGrid.openingTasks\`, \`taskGrid.deletingTasks\`, \`taskGrid.movingTask\`, \`taskGrid.openingRecord\` | Opening tasks..., Deleting tasks..., Moving task..., Opening record... |
| \`taskGrid.createTaskFailed\`, \`taskGrid.openTasksFailed\`, \`taskGrid.moveTaskFailed\`, \`taskGrid.openRecordFailed\`, \`taskGrid.deleteTasksFailed\` | The task could not be created., The tasks could not be opened., The task could not be moved., The record could not be opened., Some tasks were not deleted. |
| \`taskGrid.actionFailed\` | The action could not be completed. |
| \`taskGrid.projectLookupAmbiguous\` | Several task columns link to the project ({{ columns }}); filter the FetchXML by one of them. |

## Modules

| Key | Default |
|---|---|
| \`customColumns.addCustomColumn\`, \`customColumns.editCustomColumn\`, \`customColumns.deleteCustomColumn\` | Add custom column, Edit custom column, Delete custom column |
| \`customColumns.confirmColumnDelete\` | Do you want to delete this column and its values in every task? |
| \`customColumns.newColumnName\` | Custom column {{ number }} |
| \`customColumns.yes\`, \`customColumns.no\` | Yes, No |
| \`customColumns.customColumnsFailed\`, \`customColumns.loadCustomColumnsFailed\` | The custom column could not be changed., The custom column values could not be loaded. |
| \`lookupMany.noRecordsFound\`, \`lookupMany.loading\` | No records found., Loading... |
| \`lookupMany.remove\` | Remove {{ name }} |
| \`lookupMany.loadLookupManyFailed\` | The related records could not be loaded. |
| \`templates.task\`, \`templates.fromTemplate\`, \`templates.saveAsTemplate\` | Task, From template, Save as template |
| \`templates.searchTemplates\`, \`templates.noTemplates\`, \`templates.name\` | Search templates, No templates found, Name |
| \`templates.creatingTasksFromTemplate\`, \`templates.savingTemplate\`, \`templates.templatesFailed\` | Creating tasks from template..., Saving template..., The template could not be used. |
| \`checklist.checklist\`, \`checklist.loadChecklistFailed\` | Checklist, The checklists could not be loaded. |
| \`dependencies.predecessors\`, \`dependencies.successors\` | Predecessors, Successors |
| \`dependencies.creatingDependency\`, \`dependencies.savingDependency\`, \`dependencies.deletingDependency\` | Creating dependency..., Saving dependency..., Deleting dependency... |
| \`dependencies.dependenciesFailed\`, \`dependencies.loadDependenciesFailed\` | The dependency could not be saved., The dependencies could not be loaded. |

## Gantt

| Key | Default |
|---|---|
| \`gantt.zoomSlider\`, \`gantt.zoomToFit\`, \`gantt.goToToday\`, \`gantt.showTask\` | Zoom, Zoom to fit, Go to today, Show on timeline |
| \`markers.today\`, \`markers.projectStart\`, \`markers.projectEnd\` | Today, Project start, Project end |
| \`markers.loadMarkersFailed\` | The markers could not be loaded. |
| \`nonWorkingDays.hideNonWorkingDays\`, \`nonWorkingDays.weekend\` | Hide non-working days, Weekend |
| \`nonWorkingDays.loadNonWorkingDaysFailed\` | The non-working days could not be loaded. |
| \`taskTooltip.duration\` | Duration |
| \`links.predecessor\`, \`links.successor\` | Predecessor, Successor |
| \`links.finishToStart\`, \`links.startToStart\`, \`links.finishToFinish\`, \`links.startToFinish\` | Finish to start, Start to start, Finish to finish, Start to finish |
| \`links.linkStart\`, \`links.linkEnd\` | (start), (end) |
| \`links.confirmDeleteLink\` | Delete this dependency? |

The task grid's toolbar and cells also show DatasetControl and Grid strings: see [**DatasetControl › Localization**](?path=/docs/datasetcontrol-localization--overview) and [**Grid › Localization**](?path=/docs/grid-localization--overview). Column and option names come from the store.
`

const meta = {
    title: 'TaskGrid/Localization',
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

export const TranslateIntoCzech: Story = {
    name: 'Translate into Czech',
    render: () => renderStory(<CzechTaskGridExample />),
    parameters: {
        docs: {
            description: {
                story: `The task grid under \`CZECH_LABELS\`, with one label of its own. Try: open the settings, the ribbon or a row's **+**, then change a label in **Code**.`,
            },
        },
    },
}
