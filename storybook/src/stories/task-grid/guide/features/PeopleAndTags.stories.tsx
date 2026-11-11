import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../task-grid/guide/GuideSteps'
import { PeopleAndTagsExample } from '../../../../task-grid/guide/features/peopleAndTagsExamples'

const STEP = 'People and tags'

const DESCRIPTION = `
{{block: progress}}

Every task needs people to do it, and the team sorts the work into Facilities, IT, Legal and Event. *Assigned to* and *Tags* hold several of each on every task, picked from the people and the tags of the plan.

{{canvas: People and tags}}

## How it works

This step adds a task module, Lookup many, to the plan of [**The timeline**](?path=/docs/controls-taskgrid-guide-basics-the-timeline--overview). In **Code**, the new lines carry \`//new:\`, and *people.ts* and *tags.ts* hold the records.

A lookup-many column holds several records of another table on each task, drawn as pills. One module holds every such column, and its memory factory, \`createMemoryLookupManyModule\`, takes three things:

| Parameter | Holds | In the example |
|---|---|---|
| \`sources\` | The records to pick from, by entity name: a \`MemoryTable\`, its metadata and its columns | The five people and the four tags |
| \`columns\` | Each column under the name views give it: its \`displayName\`, the \`entityName\` it picks from, and its \`appearance\` | \`assignedto\` and \`tags\` |
| \`values\` | Each task's picks, as \`{ taskId, values }\` with \`values\` by column name | Made from \`ASSIGNMENTS\` and \`TASK_TAGS\` |

A pick is a reference, \`{ id: { guid }, etn, name }\`, that carries its record in \`data\`, as *people.ts* and *tags.ts* build them. The \`appearance\` reads that record:

| \`appearance\` | Draws each pick as |
|---|---|
| \`{ type: 'plain' }\`, the default | A grey pill with its name |
| \`{ type: 'colorful' }\` | A pill in the record's \`color\`, or the field \`colorPropertyName\` names |
| \`{ type: 'people' }\` | A round picture from the record's \`imageurl\`, or the field \`imageUrlPropertyName\` names, and the person's initials without one |

Editing and filtering come from the grid modules the plan already has, and one more. With \`enableEditing\` and \`createTaskEditingModule()\`, a double-click on a cell opens a searchable picker over it, and each pick saves on its own. With \`createFilteringModule()\`, *Filter By* in the column's menu filters by the records, and the tasks above each match stay, as in every filter of the tree.

In Dataverse, \`createDataverseLookupManyModule\` reads each column through a relationship of the task table; its parameters are under *Task modules* on [**Reference**](?path=/docs/controls-taskgrid-reference--overview).

## Try it

- Press *Expand one level* twice, then double-click the *Assigned to* cell of *Install the network* and pick Petra Svobodová: her pill joins Martin's.
- Open the menu of *Assigned to*, pick *Filter By*, choose Jana Nováková and apply: the plan shows her tasks, *Sign the lease* and *Move in*, under *Move to the new office*, which is hers too.
- In **Code**, set the \`appearance\` of \`tags\` to \`{ type: 'plain' }\`: the tags turn grey.

## Remember

- Lookup many is a task module: each of its columns holds several records of another table.
- \`sources\` are the records to pick from, \`columns\` the columns, and \`values\` each task's picks.
- A pill takes its colour or picture from the record its reference carries.
- Picking in a cell needs the editing module in \`TaskGrid\`, and filtering the filtering module.

{{block: navigation}}
`

const meta = {
    title: 'Controls/TaskGrid/Guide/Features/People and tags',
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

export const PeopleAndTags: Story = {
    name: 'People and tags',
    tags: ['!dev'],
    render: () => renderStory(<PeopleAndTagsExample />),
}
