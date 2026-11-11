import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../task-grid/guide/GuideSteps'
import { ChecklistsAndCustomColumnsExample } from '../../../../task-grid/guide/features/checklistsAndCustomColumnsExamples'

const STEP = 'Checklists and custom columns'

const DESCRIPTION = `
{{block: progress}}

A checklist shows how far a task has got, item by item. Custom columns let the team track what it needs, such as a budget or a supplier, without anyone changing the task table.

{{canvas: Checklists and custom columns}}

## How it works

This step adds two task modules to the plan of [**The timeline**](?path=/docs/controls-taskgrid-guide-basics-the-timeline--overview), and \`DatasetControl.EditColumns\` to its header. In **Code**, the new lines carry \`//new:\`, and *checklists.ts* holds the items.

**Checklists.** \`createMemoryTaskChecklistModule({ items })\` reads each task's checklist from the table you pass, one row per item with the \`taskId\` it belongs to. Its column, \`TASK_CHECKLIST_COLUMN_NAME\`, shows the items done out of all of them, such as *1/4*, and a task without items shows nothing. The cell is read-only: the items change where they are kept, here in the table. In TALXIS, \`createTalxisTaskChecklistModule()\` reads them from each task's \`talxis_checklistjson\` column.

**Custom columns.** \`createMemoryCustomColumnsModule\` holds the team's own columns, and loads them before the tasks. A custom column is drawn, edited, sorted and filtered like any column of its data type.

| Parameter | Holds |
|---|---|
| \`columns\` | Each column's \`name\`, \`displayName\` and \`dataType\`, with \`precision\` or \`options\` where its type takes them, and optionally \`isRequired\` and \`createdOn\`, which orders the columns |
| \`values\` | Each task's values, as \`{ taskId, values }\` with \`values\` by the columns' full names |
| \`enableCreation\` | *Add custom column* in *Edit columns* |
| \`enableDeletion\` | A delete command beside each custom column in *Edit columns* |

A column's full name is its \`name\` followed by \`DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX\`, which the module adds; \`values\` and views use the full name. In memory, *Add custom column* adds a text column named *Custom column* with the next number; in TALXIS, \`createTalxisCustomColumnsModule\` opens a form to define it.

## Try it

- In **Code**, open *checklists.ts* and set \`isCompleted\` of *Test the Wi-Fi on every floor* to \`true\`. Back in **Preview**, press *Expand one level* twice: *Install the network* shows *2/4*.
- Open *Edit columns*, pick *Add custom column* and save: a text column, *Custom column 3*, appears beside *Task*.
- Double-click the *Budget* cell of *Paint the meeting rooms*, type 4000 and press Enter: the budget saves at once.

## Remember

- The checklist is a task module whose column counts each task's items done.
- Custom columns are a task module for the team's own columns, loaded before the tasks.
- A custom column's full name ends with \`DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX\`, and views name it so.
- *Edit columns* adds and deletes custom columns once the module enables it.

{{block: navigation}}
`

const meta = {
    title: 'Controls/TaskGrid/Guide/Features/Checklists and custom columns',
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

export const ChecklistsAndCustomColumns: Story = {
    name: 'Checklists and custom columns',
    tags: ['!dev'],
    render: () => renderStory(<ChecklistsAndCustomColumnsExample />),
}
