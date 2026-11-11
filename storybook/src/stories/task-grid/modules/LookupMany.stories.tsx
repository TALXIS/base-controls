import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { LookupManyExample, LookupManyFilterExample, LookupManyLookExample, LookupManyReadExample, LookupManyStoreExample } from '../../../task-grid/examples/modulesExamples'

const DESCRIPTION = `
A lookup-many column holds several related records for each task, such as the people assigned to it or its tags, where an ordinary lookup holds one. The records are drawn as pills, picked in a searchable editor that pops out over the cell, and filtered and searched like the values of other columns. Try it below: double-click an *Assigned to* cell and pick a person.

{{canvas: Assign people and tags}}

## Columns

\`columns\` maps the name of each lookup-many column to what it holds:

| Key | Description |
|---|---|
| \`displayName\` | Required. The header's text. |
| \`entityName\` | Required. The table of the records it holds. |
| \`appearance\` | How its records are drawn: see below. Plain when left out. |

| Appearance | Draws each record as |
|---|---|
| \`{ type: 'plain' }\` | A pill with its name. |
| \`{ type: 'colorful', colorPropertyName? }\` | A pill tinted with the colour in the record's \`color\` field, or the field you name. |
| \`{ type: 'people', imageUrlPropertyName? }\` | An avatar with the picture in the record's \`imageurl\` field, or the field you name, and the name in a tooltip. |

The module adds the columns to the ones *Edit columns* offers, and a view shows one when it lists it by name.

## What the user can do

| To | The user | Needs |
|---|---|---|
| Pick records | Double-clicks a cell, searches, and picks or removes records; each change saves on its own. | \`enableEditing\` and \`createTaskEditingModule()\`: see [**Working with tasks**](?path=/docs/controls-taskgrid-working-with-tasks--overview). |
| Open a record | Clicks its pill, which calls \`openRelatedRecord\` of the task store: see [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview). | |
| Filter | Picks *Filter* in the column's menu, which opens the module's own filter: the records it holds, whether it holds any, or text in their names. | \`createFilteringModule()\` in \`TaskGrid\` |
| Sort | Sorts the tasks by the column. | \`createSortingModule()\` in \`TaskGrid\` |
| Search | Types in quick find, which searches the names in the column. | The view passes the column to \`setQuickFindColumns\`. |

When the store offers no records for a cell, its editor is disabled. A view filters a lookup-many column with a condition on the ids of its records, as this one does:

{{story: Filter and search by people}}

## In memory

\`createMemoryLookupManyModule\` reads the records to pick from in \`sources\`, by table name: \`{ records, metadata, columns }\`, with \`records\` a [**\`MemoryTable\`**](?path=/docs/controls-taskgrid-loading-tasks--overview) of their own. It keeps each task's picks in \`values\`, a \`MemoryTable\` of \`{ taskId, values }\` keyed by \`taskId\`, with \`values\` holding each column's references by column name. A reference carries the record's fields in \`data\`, where the appearance reads the colour or the picture.

## In Dataverse and TALXIS

\`createDataverseLookupManyModule\` reads and writes each column through a relationship of the task table, which \`navigationPropertyName\` names from either side:

| Relationship | Saving a pick |
|---|---|
| N:N, or 1:N from the task table | Associates and disassociates the records through \`Xrm.WebApi\`, which a model-driven app provides. |
| A link table of your own, with \`customIntersection\` | Creates and deletes rows of the link table, so it can hold more than the two lookups. |

\`fetchXml\` is required: a Liquid template that selects the records offered, over \`task\`, the \`id\` and raw data of the task being edited, \`project\`, the \`id\` and the \`data\` fields of the project the [**Project**](?path=/docs/controls-taskgrid-modules-project--overview) module loaded, and \`hostRecord\`. In the filter there is no task, so \`task\` is empty. \`select\` names the related records' columns to read with them, such as the colour or the picture the appearance draws. The example's *dataverse.ts* holds both kinds of column. TALXIS tables load the same way.

## Your own store

\`createLookupManyModule({ columns, createStore })\` takes a store of yours, which loads and saves the picks and offers the records. A column type of your own can extend \`ILookupManyColumn\` with settings the store reads, as the \`department\` below does.

{{story: Staff from your own store}}

## From your code

\`useDatasetControlModule('lookupMany')\`, or \`modules.get('lookupMany')\` on the DatasetControl, returns the module:

| Member | Description |
|---|---|
| \`getValue(taskId, columnName)\` | The task's references in the column; empty while the column is not in the view. |
| \`getColumn(columnName)\` | What \`columns\` maps the column to. |
| \`reload(taskIds?)\` | Loads the tasks' references again, every loaded task's when none are given. |
| \`getError()\` | What the last load threw, until the next one starts. |
| \`getFilterCondition(columnName)\`, \`setFilterCondition(columnName, condition)\` | The column's condition in the tasks' filter. \`null\` removes it. |
| \`openFilter(columnName)\`, \`closeFilter()\` | Opens and closes the column's filter. |

{{story: Count the assignments}}

## Changing how it looks

Every lookup-many factory takes \`components\`, read at mount; an \`appearance\` draws first, and these go over it in every column. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`cell\` | \`onRenderPill\` | \`LookupManyUiPillsComponents\` | A record in a cell |
| \`editor\` | \`onRender\`, \`onRenderPill\`, \`onRenderOption\` | \`LookupManyUiSelectComponents\` | The picker in the editor, a picked record, and a record offered |
| \`editorPopup\` | \`onRender\` | \`LookupManyUiEditorPopupComponents\` | The box the editor pops out in |
| \`filter\` | \`onRenderContainer\`, \`onRenderValue\`, \`onRenderButtons\`, \`onRenderApplyButton\`, \`onRenderClearButton\`; \`callout\` and \`select\` | \`LookupManyUiFilterComponents\` | The column's filter, its callout and its picker |

{{story: Colour the teams}}

## Reference

| Factory | Parameter | Description |
|---|---|---|
| Every one | \`columns\` | Required. The lookup-many columns by name: see *Columns* above. |
| | \`components\` | See *Changing how it looks* above. |
| \`createMemoryLookupManyModule\` | \`sources\` | Required. The records to pick from, by table name. |
| | \`values\` | Required. Each task's picks, keyed by \`taskId\`. |
| \`createDataverseLookupManyModule\` | \`hostRecord\` | \`{ entityName, id?, data? }\`, the record the grid sits on. |
| \`createLookupManyModule\` | \`createStore\` | Required. Called with the task runtime on every mount. |

### Dataverse columns

Each column of \`createDataverseLookupManyModule\` takes these keys beside the ones under *Columns* above:

| Key | Description |
|---|---|
| \`navigationPropertyName\` | Required. The navigation property of the relationship, from either side. |
| \`fetchXml\` | Required. The records offered, as a Liquid template over \`task\`, \`project\` and \`hostRecord\`. |
| \`select\` | The related records' columns to read, comma separated. |
| \`customIntersection\` | \`{ navigationPropertyName }\`: the link table's navigation property to the related record, when the relationship goes through a link table of your own. |

### Your own store

| Method | Description |
|---|---|
| \`loadValues(taskIds)\` | Every column's references of these tasks, by task id and column name. A task left out holds none. |
| \`saveValue(taskId, columnName, value)\` | Saves a task's references in one column. |
| \`createOptionsProvider({ record, column, settings, taskRuntime })\` | A provider over the records the column can take, searched by the editor and the filter. \`settings\` is what \`columns\` maps the column to, and \`record\` is missing for the filter. \`undefined\` disables the editor. |
| \`destroy()\` | Optional. Called when the mount goes. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Custom columns', iconName: 'TripleColumnEdit', href: '?path=/docs/controls-taskgrid-modules-custom-columns--overview', text: 'Columns users add to the tasks themselves.' },
    { title: 'Project', iconName: 'ProjectCollection', href: '?path=/docs/controls-taskgrid-modules-project--overview', text: 'The project a column\'s FetchXML narrows the records to.' },
    { title: 'Sorting and filtering', iconName: 'Filter', href: '?path=/docs/controls-grid-modules-sorting-and-filtering--overview', text: 'The grid modules behind the column menu.' },
]

const meta = {
    title: 'Controls/TaskGrid/Modules/Lookup many',
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

export const AssignPeopleAndTags: Story = {
    name: 'Assign people and tags',
    render: () => renderStory(<LookupManyExample />),
}

export const FilterAndSearchByPeople: Story = {
    name: 'Filter and search by people',
    render: () => renderStory(<LookupManyFilterExample />),
    parameters: {
        docs: {
            description: {
                story: `A view of the tasks tagged *security*, whose quick find also searches the people assigned. Try: search for *Maya*.`,
            },
        },
    },
}

export const StaffFromYourOwnStore: Story = {
    name: 'Staff from your own store',
    render: () => renderStory(<LookupManyStoreExample />),
    parameters: {
        docs: {
            description: {
                story: `Two columns over one staff list, each offering the department its settings name. Try: double-click a *Reviewers* cell.`,
            },
        },
    },
}

export const CountTheAssignments: Story = {
    name: 'Count the assignments',
    render: () => renderStory(<LookupManyReadExample />),
    parameters: {
        docs: {
            description: {
                story: `A header that counts each person's tasks with \`getValue\`. Try: assign someone to a task, then press *Count assignments*.`,
            },
        },
    },
}

export const ColourTheTeams: Story = {
    name: 'Colour the teams',
    render: () => renderStory(<LookupManyLookExample />),
    parameters: {
        docs: {
            description: {
                story: `The default pill with a colour for each team, in the cells and in the editor. Try: double-click a *Teams* cell.`,
            },
        },
    },
}
