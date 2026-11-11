import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../task-grid/guide/GuideSteps'
import { ApiStoreExample, ModuleStoreExample } from '../../../../task-grid/guide/your-data/yourOwnBackendExamples'

const STEP = 'Your own backend'

const DESCRIPTION = `
{{block: progress}}

When the tasks live behind an API of your own, you write the store: one method for each thing the task grid asks. Modules take stores of their own in the same way, and \`synchronize()\` shows the changes your backend makes on its own, such as a date it moves.

{{canvas: Your own backend}}

## How it works

*api.ts* stands in for your backend: the office plan in a shape of its own, behind async calls, and one rule: a parent is due with its last subtask. *GridExample.tsx* puts a store over it and returns it from \`onLoad\` like any other.

| Method | Returns |
|---|---|
| \`load(provider)\` | \`{ rawData, metadata, columns }\`: every task of the view as rows, \`metadata\` naming the id column as \`PrimaryIdAttribute\`, and the columns |
| \`getAvailableColumns()\`, \`getAvailableRelatedColumns()\` | The columns views and *Edit columns* can show |
| \`createTask({ parentRecord, stackRank, data, taskId })\` | \`{ record }\` as your backend saved it, or \`null\` to drop the task |
| \`saveTask(task)\` | \`{ recordId, success, fields }\`, for an edit or for a move with its new parent and rank |
| \`deleteTasks({ taskIds, tree })\` | \`{ success, deletedTaskIds }\`, with \`errors\` for the tasks it could not delete, or \`null\` when the user cancelled |
| \`openTasks(taskIds)\` | For *Edit*: \`{ success: true }\` once the editor closes, or \`null\` when nothing changed |
| \`openRelatedRecord(reference, columnName)\` | Nothing; it opens the record a lookup points to |
| \`canDeleteTask(task)\` | Optional. \`false\` keeps the task, and every task above it, from being deleted |
| \`synchronize()\` | Optional. \`{ updatedRecords }\`, the tasks your backend changed on its own |

*What reaches the store* on [**Where tasks are kept**](?path=/docs/controls-taskgrid-guide-your-data-where-tasks-are-kept--overview) says when each one is called, and [**Reference**](?path=/docs/controls-taskgrid-reference--overview) has every type.

The rows reach the grid in the shape the field mapping names, so \`toRow\` and \`toApiTask\` translate between your API's tasks and the rows. Throw from a method your backend does not support, as \`openRelatedRecord\` does here.

To change one thing a built-in store does, extend it instead: override \`createTask\` of \`DataverseTaskStore\` to give new tasks values of their own, or add \`canDeleteTask\` to keep some tasks from being deleted.

### Dates the backend changes

After every create, save and delete, the task grid calls \`synchronize()\` and merges the rows it returns into the plan, keeping the user's unsaved edits. Here it asks *api.ts* which tasks its rule moved. \`DataverseTaskStore\` answers with the tasks modified since it last read them, so on Dataverse you write nothing.

## Stores for the modules

A module that keeps data takes a store in the same way: its base factory takes \`createStore\`, which it calls with the task runtime on every mount. Where a module's data is kept does not depend on where the tasks are: here the tasks stay in memory, and the checklists come from an API.

{{canvas: Stores for the modules}}

| Module | Base factory | Its store has |
|---|---|---|
| Project | \`createProjectModule\` | \`loadProject()\` |
| Lookup many | \`createLookupManyModule\` | \`loadValues(taskIds)\`, \`saveValue\`, \`createOptionsProvider\` |
| Dependencies | \`createDependenciesModule\` | \`loadDependencies(taskIds)\`, \`createDependency\`, \`updateDependency\`, \`deleteDependency\` |
| Checklist | \`createTaskChecklistModule\` | \`loadItems(taskIds)\` |
| Custom columns | \`createCustomColumnsModule\` | \`loadColumns()\`, \`loadValues(taskIds)\`, \`saveValue\`, \`createColumn\`, \`updateColumn\`, \`deleteColumn\` |
| Templates | \`createTemplatesModule\` | \`createTemplatesProvider()\`, \`createTasks\`, and optionally \`createTemplate\` |
| Markers, in \`TaskGantt\` | \`createMarkersModule\` | \`loadMarkers()\` |
| Non-working days, in \`TaskGantt\` | \`createNonWorkingDaysModule\` | \`loadNonWorkingDays()\` |

A task module's store may also have \`destroy()\`, which runs when the mount goes. The store of the user views is on [**User views**](?path=/docs/controls-datasetcontrol-views-user-views--overview).

## Try it

- Open *Move to the new office* and *Fit out the space*, then double-click the *Due* of *Paint the meeting rooms* and set it to 6 March: once it saves, *Fit out the space* is due 6 March too.
- Click the row of *Move in*, so that only it is selected, press *Delete* and confirm: *Move to the new office* is due with *Book the movers*, on 6 March.
- In *Stores for the modules*, set \`isCompleted\` of *Hand out the keys* to \`true\` in *checklists.ts*, then open *Move to the new office*: *Move in* shows 1/3.

## Remember

- A store has one method for each thing the task grid asks; \`canDeleteTask\` and \`synchronize\` are optional.
- Your rows reach the grid in the shape the field mapping names.
- \`synchronize()\` brings back what your backend changed on its own, after every change.
- A module keeps its data in a store of its own, wherever the tasks are kept.

Your plan runs on your data. Advanced makes it look and behave your way.

{{block: navigation}}
`

const meta = {
    title: 'Controls/TaskGrid/Guide/Your data/Your own backend',
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

export const YourOwnBackend: Story = {
    name: 'Your own backend',
    tags: ['!dev'],
    render: () => renderStory(<ApiStoreExample />),
}

export const StoresForTheModules: Story = {
    name: 'Stores for the modules',
    tags: ['!dev'],
    render: () => renderStory(<ModuleStoreExample />),
}
