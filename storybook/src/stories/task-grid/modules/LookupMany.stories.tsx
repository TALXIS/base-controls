import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { LookupManyExample } from '../../../task-grid/examples/modulesExamples'

const DESCRIPTION = `
A lookup-many column holds many related records per task, such as the people assigned to it or its tags. The records are drawn as pills, picked in a searchable pop-out editor, and filtered and searched like any other column.

\`\`\`tsx
const COLUMNS: { [columnName: string]: ILookupManyColumn } = {
    assignedto: { displayName: 'Assigned to', entityName: 'person', appearance: { type: 'people' } },
    tags: { displayName: 'Tags', entityName: 'tag', appearance: { type: 'colorful' } },
}

const controlModules = React.useMemo(() => [createMemoryLookupManyModule({ sources: SOURCES, columns: COLUMNS, values: VALUES })], [])
\`\`\`

A view shows a column by listing it by name, as a \`Lookup.Simple\` column: \`{ name: 'assignedto', displayName: 'Assigned to', dataType: 'Lookup.Simple' }\`.

{{story: Assign people and tags}}

## Columns

\`columns\` maps each column's name to:

| Key | Description |
|---|---|
| \`displayName\` | Required. The header's text. |
| \`entityName\` | Required. The table the related records are of. |
| \`appearance\` | How the pills look. See below. |

| Appearance | Pills |
|---|---|
| \`{ type: 'plain' }\` | The record's name. The default. |
| \`{ type: 'colorful', colorPropertyName? }\` | Tinted with the colour in each record's \`color\` field, or the one you name. |
| \`{ type: 'people', imageUrlPropertyName? }\` | An avatar from each record's \`imageurl\` field, or the one you name, with the name in a tooltip. |

Clicking a pill opens its record through the store. Editing needs \`enableEditing\` and \`createTaskEditingModule()\`, and a column whose store offers nothing to pick from stays read-only. For quick find to search a column, list it in the view's \`quickFindColumns\`.

## Where the values are kept

| Factory | Keeps the values |
|---|---|
| \`createMemoryLookupManyModule\` | In memory. \`sources\` holds the records to pick from, by table: \`{ records, metadata, columns }\`. \`values\` holds each task's references, by task id and column name. |
| \`createDataverseLookupManyModule\` | In Dataverse, through each column's 1:N or N:N relationship. |
| \`createLookupManyModule\` | In a store of yours: \`onCreateStore\` returns an \`ILookupManyStore\`. |

### Dataverse

\`\`\`tsx
createDataverseLookupManyModule({
    hostRecord: { entityName: 'msdyn_project', id: projectId },
    columns: {
        assignedto: {
            displayName: 'Assigned to',
            entityName: 'systemuser',
            navigationPropertyName: 'task_assignees',
            appearance: { type: 'people', imageUrlPropertyName: 'entityimage_url' },
            select: 'fullname,entityimage_url',
            fetchXml: \`<fetch><entity name="systemuser"><attribute name="fullname" /></entity></fetch>\`,
        },
    },
})
\`\`\`

| Column key | Description |
|---|---|
| \`navigationPropertyName\` | Required. The navigation property of the relationship, from either side. |
| \`select\` | The related records' columns to read, comma separated, such as the colour or the picture. |
| \`fetchXml\` | The records to pick from, as a Liquid template over \`task\`, \`project\` and \`hostRecord\`. Without it, the column is read-only. |
| \`customIntersection\` | \`{ navigationPropertyName }\`, when the relationship goes through an intersection table of your own. |

### Your own store

| Method | Description |
|---|---|
| \`onLoadValues(taskIds)\` | Every column's references of these tasks, by task id and column name. |
| \`onSaveValue(taskId, columnName, value)\` | Saves a task's references in one column. |
| \`onCreateOptionsProvider({ record, column, settings, taskRuntime })\` | A provider over the records the column can take, searched by the editor and the filter. \`undefined\` makes the column read-only. \`record\` is missing for the filter. |

## Changing how it looks

\`createLookupManyModule\` and its variants take \`components\`, read at mount. How slots work is under *Changing how it looks* on [**Grid › Appearance**](?path=/docs/controls-grid-appearance--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`cell\` | \`onRenderPill\` | \`LookupManyPillsComponents\` | The pills in a cell |
| \`editor\` | \`onRenderSelect\`, \`onRenderPill\`, \`onRenderOption\` | \`LookupManySelectComponents\` | The picker in the editor |
| \`editorPopup\` | \`onRenderContainer\` | \`LookupManyEditorPopupComponents\` | The pop-out the editor sits in |
| \`filter\` | \`onRenderContainer\`, \`onRenderValue\`, \`onRenderButtons\`, \`onRenderApplyButton\`, \`onRenderClearButton\`; \`callout\` and \`select\` | \`LookupManyFilterComponents\` | The column's filter callout |

An \`appearance\` draws its pills and options first, and \`cell\`, \`editor\` and \`filter.select\` go over them.
`

const meta = {
    title: 'Controls/TaskGrid/Modules/Lookup many',
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

export const AssignPeopleAndTags: Story = {
    name: 'Assign people and tags',
    render: () => renderStory(<LookupManyExample />),
    parameters: {
        docs: {
            description: {
                story: `Three lookup-many columns in memory: people, coloured tags and plain teams. Try: double-click a *Tags* cell and add a tag, or filter *Assigned to* from its column menu. Open **Code** and change an \`appearance\`.`,
            },
        },
    },
}
