import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../task-grid/guide/GuideSteps'
import { TemplatesAndTheProjectExample } from '../../../../task-grid/guide/features/templatesAndTheProjectExamples'

const STEP = 'Templates and the project'

const DESCRIPTION = `
{{block: progress}}

Every meeting room needs the same three tasks, so a template plans them in one go. The project module says which project the plan belongs to, and the timeline marks when the project starts and ends.

{{canvas: Templates and the project}}

## How it works

This step adds two task modules and a Gantt module to the plan of [**The timeline**](?path=/docs/controls-taskgrid-guide-basics-the-timeline--overview). In **Code**, the new lines carry \`//new:\`, *templates.ts* holds the template and *project.ts* the project.

**Templates.** A template is a task with its subtasks, kept so the same work can be planned again. Its own task is named after the template, and each task under it sets its column values in \`data\`, with \`children\` of its own. \`createMemoryTemplatesModule({ tasks, templates })\` creates their tasks in \`tasks\`, the table the store reads, and keeps the templates the user saves in \`templates\`.

| Command | Where | Does | Needs |
|---|---|---|---|
| *From template* | Under *New* in the ribbon, and on the **+** of each task | Creates the template's tasks at the top of the plan, or under that task | \`enableCreation\` |
| *Save as template* | In the ribbon, while one task is selected | Keeps the task and every task under it as a template named after it | The row selection module |

There is no Dataverse or TALXIS templates module: keep templates in your own backend with \`createTemplatesModule({ createStore })\`, as [**Your own backend**](?path=/docs/controls-taskgrid-guide-your-data-your-own-backend--overview) shows for a module's store.

**The project.** \`createMemoryProjectModule({ projects, projectId })\` loads the project the tasks belong to on every mount, before the tasks. A project has an \`id\`, a \`name\` and its \`startDate\` and \`endDate\` as ISO strings. Anything inside the control finds the module with \`useDatasetControlModule('project')\`, as \`ProjectDates\` in the header does, and reads it with \`getName()\`, \`getStartDate()\` and \`getEndDate()\`, the dates as dayjs. In Dataverse, \`createDataverseProjectModule\` loads it from a table of yours.

**Marking the project.** \`createMarkersModule()\` is a Gantt module that marks today on the timeline, and the project's start and end while a project module is loaded. [**Dates on the timeline**](?path=/docs/controls-taskgrid-guide-features-dates-on-the-timeline--overview) adds markers of the plan's own.

## Try it

- Press *Expand one level* twice, then press **+** on *Fit out the space* and pick *From template* › *Set up a meeting room*: the room goes first under *Fit out the space*, and its chevron opens its three tasks.
- Select *Plan the opening party* and click *Save as template*: *New* › *From template* now offers it beside *Set up a meeting room*.
- In **Code**, open *project.ts* and set \`endDate\` to \`'2026-04-17'\`: the header and the *Project end* marker move to 17 April.

## Remember

- Templates and the project are task modules; the markers that show the project's dates are a Gantt module.
- A template is a task and its subtasks, created in the table the store reads.
- *From template* needs \`enableCreation\`, and *Save as template* one selected task.
- The project loads before the tasks, and \`useDatasetControlModule('project')\` reads it.

{{block: navigation}}
`

const meta = {
    title: 'Controls/TaskGrid/Guide/Features/Templates and the project',
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

export const TemplatesAndTheProject: Story = {
    name: 'Templates and the project',
    tags: ['!dev'],
    render: () => renderStory(<TemplatesAndTheProjectExample />),
}
