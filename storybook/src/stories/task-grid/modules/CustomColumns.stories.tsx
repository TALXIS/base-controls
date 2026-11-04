import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { CustomColumnsExample } from '../../../task-grid/examples/modulesExamples'

const DESCRIPTION = `
Custom columns are columns users add to the tasks themselves, from *Edit columns*. Each one is drawn and edited like any column of its data type, and saved apart from the tasks. Try it below: add *Risk* to the view from *Edit columns*.

{{canvas: Add your own columns}}

## Options

| Option | Default | Description |
|---|---|---|
| \`enableCreation\` | \`false\` | *Add custom column* in *Edit columns*. |
| \`enableEditing\` | \`false\` | An edit command on each custom column in *Edit columns*. Not on the IndexedDB module. |
| \`enableDeletion\` | \`false\` | A delete command on each custom column in *Edit columns*, which deletes its values in every task too, after the user confirms. |

The values are edited in the grid, with \`createTaskEditingModule()\`, and saved one by one.

## Where the columns are kept

| Factory | Keeps the columns and their values |
|---|---|
| \`createIndexedDbCustomColumnsModule\` | In the browser's IndexedDB, under \`databaseName\`. \`columns\` are what a new database starts with. |
| \`createTalxisCustomColumnsModule\` | In TALXIS attribute definitions and attribute values. A new or edited column opens the definition's form in a side dialog. |
| \`createCustomColumnsModule\` | In a store of yours: \`onCreateStore\` returns an \`ICustomColumnsStore\`. |

Each of the IndexedDB \`columns\` is a \`displayName\`, a \`dataType\`, and \`isRequired\`, \`precision\` or \`options\` where they apply. A column the user adds is a text column named *Custom column 1*, and so on. The example's *talxis.ts* keeps the project's columns in TALXIS.

## Reference

### TALXIS

| Parameter | Description |
|---|---|
| \`entityName\` | Required. The table the columns are defined for. |
| \`recordId\` | Only the columns defined for this record, such as the project. |
| \`navigationPropertyName\` | The relationship from the tasks to their attribute values, when there are several. |

### Your own store

| Method | Description |
|---|---|
| \`onLoadColumns()\` | Every custom column, as an \`IColumn\` whose name ends in \`DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX\`. Called before the tasks load. |
| \`onLoadValues(taskIds)\` | The tasks' values, by task id and column name. |
| \`onSaveValue(record, column, value)\` | Saves one value and returns the save result. |
| \`onCreateColumn()\`, \`onUpdateColumn(columnName)\`, \`onDeleteColumn(columnName)\` | Create, change or delete a column, such as in a dialog of yours. Return the column's name, or \`null\` when the user cancelled. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Lookup many', iconName: 'People', href: '?path=/docs/controls-taskgrid-modules-lookup-many--overview', text: 'Columns of many related records, such as assignees and tags.' },
    { title: 'Edit columns', iconName: 'TripleColumnEdit', href: '?path=/docs/controls-datasetcontrol-parts-edit-columns--overview', text: 'The panel where users pick, order and add columns.' },
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
