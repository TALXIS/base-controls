import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { CustomColumnsExample, CustomColumnsStoreExample } from '../../../task-grid/examples/modulesExamples'

const DESCRIPTION = `
Custom columns are columns that users add to the tasks themselves, such as a risk or a budget, without anyone changing the task table. Each one is drawn, edited, sorted and filtered like any column of its data type, and its values are kept apart from the tasks. Try it below: open *Edit columns* and pick *Add custom column*.

{{canvas: Add your own columns}}

## What the user can do

The user manages the columns in *Edit columns*, as far as the module's options allow:

| Option | Default | The user |
|---|---|---|
| \`enableCreation\` | \`false\` | Adds a column with *Add custom column*. |
| \`enableEditing\` | \`false\` | Changes a column with the edit command beside it. Not on the memory module. |
| \`enableDeletion\` | \`false\` | Deletes a column with the delete command beside it, once they confirm that its values go too. |

The values are edited in the cells, with \`enableEditing\` on \`TaskDatasetControl\` and \`createTaskEditingModule()\` in \`TaskGrid\` (see [**Working with tasks**](?path=/docs/controls-taskgrid-working-with-tasks--overview)), and each one saves on its own.

## Column names

The module tells its columns by the end of their name, \`DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX\` from \`@talxis/client-libraries\`. A view lists a custom column by its full name, and the values are keyed by it, as in the example.

## In memory

\`createMemoryCustomColumnsModule\` keeps the columns in the \`columns\` [**\`MemoryTable\`**](?path=/docs/controls-taskgrid-loading-tasks--overview), keyed by \`name\`, and each task's values in \`values\`, as \`{ taskId, values }\` keyed by \`taskId\`. A row of \`columns\` holds:

| Field | Description |
|---|---|
| \`name\` | Required. The column's name; the suffix is added where it is missing. |
| \`displayName\` | Required. The header's text. |
| \`dataType\` | Required. Such as \`'SingleLine.Text'\`, \`'Decimal'\`, \`'Currency'\`, \`'OptionSet'\`, \`'TwoOptions'\` or \`'DateAndTime.DateOnly'\`. |
| \`isRequired\` | Whether a value is required. |
| \`precision\` | The decimal places of a decimal or currency column. |
| \`options\` | The labels of a choice column's options, in order. Their values count from \`1\`. |
| \`createdOn\` | Orders the columns; a row without it comes first. |

A column the user adds is a text column named *Custom column* and the next number. To change that name, see [**Localization**](?path=/docs/concepts-localization--overview).

## In TALXIS

\`createTalxisCustomColumnsModule\` keeps each column as a \`talxis_attributedefinition\` record and each value as a \`talxis_attributevalue\` record of its task. It reaches the values through a relationship from the task table to \`talxis_attributevalue\`: \`navigationPropertyName\` picks it when there are several, and the control fails to load when there is none.

It loads the columns defined for \`entityName\` and those defined for every table, and with \`recordId\`, also those of that record, such as the project. *Add custom column* and the edit command open the definition's form in a dialog. It reads the definitions through \`Xrm\`, so it runs in a model-driven app. The example's *talxis.ts* sets it up. There is no other Dataverse variant: for columns kept elsewhere, write a store, as below.

## Your own store

\`createCustomColumnsModule({ createStore })\` takes a store of yours, which gives the module the columns and their values. Its methods are under *Reference* below.

{{story: Columns from your own store}}

## Reference

### Options

Every factory takes \`enableCreation\`, \`enableEditing\` and \`enableDeletion\`, described under *What the user can do* above; the memory one leaves out \`enableEditing\`.

| Factory | Parameter | Description |
|---|---|---|
| \`createMemoryCustomColumnsModule\` | \`columns\` | Required. The columns, keyed by \`name\`. |
| | \`values\` | Required. Each task's values, keyed by \`taskId\`. |
| \`createTalxisCustomColumnsModule\` | \`entityName\` | Required. The table the columns are defined for. |
| | \`recordId\` | Also loads the columns defined for this record, such as the project. |
| | \`navigationPropertyName\` | The relationship from the task table to \`talxis_attributevalue\`, when there are several. |
| \`createCustomColumnsModule\` | \`createStore\` | Required. Called with the task runtime on every mount. |

### Your own store

| Method | Description |
|---|---|
| \`loadColumns()\` | Every custom column, as an \`IColumn\` whose name ends in the suffix. Called on every mount before the tasks load, and after a column is created, changed or deleted. |
| \`loadValues(taskIds)\` | The tasks' values, by task id and column name. A task left out has none. |
| \`saveValue(record, column, value)\` | Saves one value and returns the save result. |
| \`createColumn()\` | Creates a column, such as in a dialog of yours, and returns its name, or \`null\` when the user cancelled. |
| \`updateColumn(columnName)\` | Changes a column and returns its name, or \`null\` when the user cancelled. |
| \`deleteColumn(columnName)\` | Deletes a column and returns its name, or \`null\` when it was not deleted. |
| \`destroy()\` | Optional. Called when the mount goes. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Edit columns', iconName: 'TripleColumnEdit', href: '?path=/docs/controls-datasetcontrol-parts-edit-columns--overview', text: 'The panel where users pick, order and add columns.' },
    { title: 'Lookup many', iconName: 'People', href: '?path=/docs/controls-taskgrid-modules-lookup-many--overview', text: 'Columns of many related records, such as assignees and tags.' },
    { title: 'Modules', iconName: 'Puzzle', href: '?path=/docs/controls-taskgrid-modules--overview', text: 'Every task module, and what each backend needs.' },
]

const meta = {
    title: 'Controls/TaskGrid/Modules/Custom columns',
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

export const AddYourOwnColumns: Story = {
    name: 'Add your own columns',
    render: () => renderStory(<CustomColumnsExample />),
}

export const ColumnsFromYourOwnStore: Story = {
    name: 'Columns from your own store',
    render: () => renderStory(<CustomColumnsStoreExample />),
    parameters: {
        docs: {
            description: {
                story: `A *Story points* column whose values a store of yours keeps in a \`Map\`. Try: double-click a *Story points* cell and type a number.`,
            },
        },
    },
}
