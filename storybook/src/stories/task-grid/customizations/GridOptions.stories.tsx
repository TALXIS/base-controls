import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { ColumnValidationExample } from '../../../task-grid/ColumnValidationExample'
import { ConditionalFormattingExample } from '../../../task-grid/ConditionalFormattingExample'
import { AgGridOptionsExample } from '../../../task-grid/AgGridOptionsExample'
import { RemoteSyncExample } from '../../../task-grid/RemoteSyncExample'

const meta = {
    title: 'Task Grid/Customizations/Grid options',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            story: {
                inline: true,
            },
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                component: `
\`TaskGrid\` is built on the [**Grid**](?path=/docs/grid-get-started--overview), and takes the Grid's own props and modules. Whatever the Grid lets you do to a column, a row or AG Grid, you do to a task grid the same way.

| You want to change | Use | Reference |
|---|---|---|
| one column: its cells, validation, colours, lock, commands, width | \`colDefs\` | [**Grid → Columns**](?path=/docs/grid-columns--overview) |
| every row: its height, its lock | \`rowSettings\` | [**Grid → Props and events**](?path=/docs/grid-props-and-events--overview) |
| what happens as the user works | \`onRecordValueChanged\`, \`onAfterRecordSaved\`, \`onRowClicked\`, … | [**Grid → Props and events**](?path=/docs/grid-props-and-events--overview) |
| anything else: row classes, AG Grid options, hooks over every cell | a module of your own in \`modules.custom\` | [**Grid → Write a module**](?path=/docs/grid-extending-write-a-module--overview) |

A task grid brings its own provider, and its \`height\` and \`stateKey\` are the DatasetControl's, which the grid inside fills. \`onError\` and opening a record go through the task grid's own [**events**](?path=/story/task-grid-get-started--overview) and the descriptor's strategy.

> Flip the **Code** toggle on any story to read its snippet, and edit it: the grid recompiles as you type. \`defaultModules\` and \`defaultFeatures\` are what the grid runs with when a snippet passes no \`modules\` or \`features\` of its own.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const ColumnValidation: Story = {
    name: 'Validate a column',
    parameters: {
        docs: {
            description: {
                story: `
Flags an **Est. Effort (h)** over 500 with a message of its own. Double-click one and change the number to watch the message come and go.

- \`onGetValidation\` runs on every read, so it validates what the user just typed, not only what was loaded
- an error blocks the record's save, and the grid's own validation still applies
                `.trim(),
            },
        },
    },
    render: () => renderStory(<ColumnValidationExample />),
}

export const ConditionalFormatting: Story = {
    name: 'Conditional formatting',
    parameters: {
        docs: {
            description: {
                story: `
An overdue **Due Date** turns red while the task is still open, and a finished task tints its whole row green. Set a **Status** to *Completed* and the percentage jumps to 100, which tints the row.

- \`onGetTheme\` changes the colours a cell's theme is generated from; leaving it alone keeps the cell as the grid drew it
- \`onRecordValueChanged\` reacts to the status changing and writes the percentage
- a state of the whole task goes on the row: \`rows.registerRowClass\` in a module of your own
                `.trim(),
            },
        },
    },
    render: () => renderStory(<ConditionalFormattingExample />),
}

export const AgGridOptions: Story = {
    name: 'AG Grid options',
    parameters: {
        docs: {
            description: {
                story: `
Row animation on, **% Complete** pinned right, **Description** wrapping to as many lines as it needs, and critical rows tinted through a row class.

- \`colDefs\` takes any AG Grid column option, merged over the column the grid built
- \`registerAgGridOptions\` takes any AG Grid option the grid does not set itself
                `.trim(),
            },
        },
    },
    render: () => renderStory(<AgGridOptionsExample />),
}

export const RemoteSync: Story = {
    name: 'Sync with remote',
    parameters: {
        docs: {
            description: {
                story: `
A save can make the server recalculate other records — here, a parent's **Est. Effort (h)** is the sum of its subtasks. Expand a task, change a leaf's estimate, and after a short round trip every parent above it arrives with a new value, without reloading the grid.

- the fetch is gated on the columns that matter, so a save that touched nothing relevant costs no round trip
- only the affected rows are re-read: \`getRecordTree().structure.getAncestorIds(recordId)\`
- \`updateTaskData\` **replaces** a record's raw data, so merge the returned columns over \`getRawData()\` first
- the wait is shown per cell with \`registerCellLoading\`, so the rest of the grid stays usable
- \`registerLock\` keeps the parents' estimate read-only, so the rollup always comes from the server
                `.trim(),
            },
        },
    },
    render: () => renderStory(<RemoteSyncExample />),
}
