import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { BasicCheckListExample } from '../../check-list/BasicCheckListExample'
import { docsPageWithExample } from '../docsPageWithExample'

const DESCRIPTION = `
Checklist renders a collection of records as a list you can work: rename an item inline, tick it off, drag it to reorder, add one at the bottom, delete one. Every change is saved as it is made.

The list below is real. Flip **Code** to see what renders it, and edit it — the list keeps its items across an edit, so you can add a few and then change the code around them.

## What you get

- A list ordered by a rank you store, reordered by dragging, without reindexing every item.
- A checkbox column that marks an item finished, and strikes its text through.
- A row at the bottom that adds an item as soon as you type into it.
- A delete button per item, with a confirmation.
- Inline editing on every column you show, saved per edit.

## Render it

The control takes no data source — you hand it the records themselves:

\`\`\`tsx
import { CheckList } from '@talxis/base-controls'
import { PcfContextProvider } from '@talxis/base-controls/utils'

export const MyCheckListPage = () => (
    <PcfContextProvider>
        <CheckList onInitialize={onInitialize} />
    </PcfContextProvider>
)
\`\`\`

The checklist reads the \`ComponentFramework.Context\` — navigation, formatting, confirmation dialogs — off \`PcfContextProvider\`, so render it inside one. Pass your host's context to the provider; without one it builds a sample context.

## \`onInitialize\`

Called once, and the checklist shows a skeleton until it resolves. Return the items, their columns and the mapping over them:

\`\`\`ts
const onInitialize = async () => ({
    data: await fetchItems(),
    columns: [
        { name: 'name', dataType: 'SingleLine.Text', displayName: 'Item' },
        { name: 'completed', dataType: 'TwoOptions' },
        { name: 'stackrank', dataType: 'SingleLine.Text' },
    ],
    fieldMapping: {
        id: 'itemid',
        name: 'name',
        stackRank: 'stackrank',
        completed: 'completed',
    },
})
\`\`\`

| Key | Description |
|-----|-------------|
| \`data\` | The items, as raw records — plain objects keyed by column name. |
| \`columns\` | Their columns. Every column the field mapping points at has to be here. |
| \`fieldMapping\` | Which of those columns carry the id, the label, the order and the completion state. |

Everything you pass is copied, so the checklist never writes to your arrays.

### The field mapping

| Field | What it points at |
|-------|-------------------|
| \`id\` | The column each item is identified by. |
| \`name\` | The item's label. The one mapped column that stays visible, and the one the new-item row types into. It sits wherever you list it in \`columns\`. |
| \`stackRank\` | A text column holding a lexorank string. The list is ordered by it, and dragging an item writes a new one. Hidden. |
| \`completed\` | A \`TwoOptions\` column. Hidden — the checkbox column is what shows and changes it. |

### Extra columns

\`columns\` is not limited to the mapped four. Anything else you put there becomes its own column, in the order you listed it, editable like the rest — an option set renders as a coloured pill with a picker:

\`\`\`ts
columns: [...columns, {
    name: 'priority',
    dataType: 'OptionSet',
    displayName: 'Priority',
    metadata: {
        OptionSet: [
            { Value: 0, Label: 'Low', Color: '#69797e' },
            { Value: 1, Label: 'Normal', Color: '#0f6cbd' },
            { Value: 2, Label: 'High', Color: '#a4262c' },
        ],
    },
}]
\`\`\`

That is the \`Priority\` column in the example above. Delete it from the array in the **Code** window and it disappears; the values stay in the records either way.

## \`<CheckList />\` props

| Prop | Required | Description |
|------|:--------:|-------------|
| \`onInitialize\` | ✅ | Returns the items, their columns and the field mapping. |
| \`height?\` | — | A fixed height such as \`'400px'\`, or \`'100%'\` to fill its container. Left unset, the list is as tall as its items. |
| \`maxVisibleRows?\` | — | How many items to grow to before scrolling instead. Ignored when \`height\` is set. Defaults to \`15\`. |
| \`rowHeight?\` | — | Height of one item's row, in pixels. Defaults to \`42\`. |
| \`enableEditing?\` | — | Whether items can be changed. Defaults to \`true\`. |
| \`enableZebra?\` | — | Whether rows alternate their background. Defaults to \`false\`. |
| \`enableOptionSetColors?\` | — | Whether option-set values render as coloured pills. Defaults to \`true\`. |
| \`enableNavigation?\` | — | Whether the primary column's value is a link that opens the record. Defaults to \`true\`. |
| \`labels?\` | — | Any subset of the UI strings. See below. |
| \`controlId?\` | — | A stable id for the control. Defaults to a generated one. |
| \`licenseKey?\` | — | AG Grid enterprise license key, when your host has one. |
| \`onReady?\` | — | \`(api)\` — the imperative handle. See [**Reacting to changes**](?path=/story/checklist-reacting-to-changes--overview). |
| event props | — | One per change the list makes. See [**Reacting to changes**](?path=/story/checklist-reacting-to-changes--overview). |

\`enableEditing={false}\` covers more than the cell editors: a read-only checklist also drops the new-item row, the delete button and the dragging, and its checkboxes report without changing anything.

Sorting, filtering, selection and the auto-save are not props. The list's order is the rank you store, so sorting would fight the dragging; nothing renders a filter or a selection UI; and without the auto-save an edited item would silently revert.

## Labels

Every string the checklist renders can be replaced. Supply any subset; the rest keep their English defaults.

\`\`\`tsx
<CheckList
    onInitialize={onInitialize}
    labels={{
        newItemPlaceholder: 'Add a step…',
        markItemFinished: 'Mark as done',
        deleteItem: 'Remove',
        'confirmDialog.deleteItem.text': 'Remove this step?',
    }} />
\`\`\`

| Key | Default | Where it shows |
|-----|---------|----------------|
| \`newItemPlaceholder\` | Add an item... | In the bottom row while it is empty. |
| \`markItemFinished\` | Mark as finished | Names the checkbox column, which has no header. |
| \`deleteItem\` | Delete | Tooltip on an item's delete button. |
| \`confirmDialog.deleteItem.text\` | Are you sure you want to delete this item? | The confirmation before a delete. |

## Where to go next

- [**Reacting to changes**](?path=/story/checklist-reacting-to-changes--overview) — every event the list raises, and the api \`onReady\` hands over.
                `

const meta = {
    title: 'Checklist/Get started',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: docsPageWithExample(DESCRIPTION),
            story: {
                inline: true,
            },
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
    name: 'Overview',
    render: () => renderStory(<BasicCheckListExample />),
}
