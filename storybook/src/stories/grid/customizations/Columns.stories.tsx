import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { PinAndAlignExample, ComputedColumnExample, ActionsColumnExample, RememberWidthsExample } from '../../../grid/examples/columnsExamples'

const DESCRIPTION = `
\`colDefs\` changes the grid's columns without changing the provider. Each entry is an AG Grid column definition with a \`colId\`:

- An entry whose \`colId\` is the \`name\` of a provider column is merged over that column.
- An entry with any other \`colId\` adds a column.

\`\`\`tsx
<Grid.Root
    provider={provider}
    modules={modules}
    colDefs={[
        { colId: 'status', pinned: 'right' },
        { colId: 'actions', headerName: '', pinned: 'right', initialWidth: 130, settings: { cell: { onGetCommands: getRowCommands } } },
    ]} />
\`\`\`

\`colDefs\` is read at mount. The modules still act on the result: grouping pins grouped columns, selection adds its checkbox column.

A provider column's width comes from its \`visualSizeFactor\`. \`initialWidth\` sizes a column you add.

## \`settings\`

What the grid's cells and headers read about a column:

| Setting | What it changes |
|---|---|
| \`alignment\` | Which edge the value sits against: \`'left'\`, \`'center'\` or \`'right'\`. |
| \`oneClickEdit\` | The cell takes input where it stands, without opening an editor. |
| \`isEditable\` | Whether the column's values can be changed at all. |
| \`isRequired\` | Whether a value is required. |
| \`widthOffset\` | Extra width, in pixels, on top of the column's own. |
| \`cell\` | Callbacks run for each of the column's cells, with its record. See *\`settings.cell\`* below. |

\`settings\` is merged with what the grid set for a provider column, so an entry can change one setting and keep the rest.

## \`settings.cell\`

Each runs before the hook of the same kind on [**Hooks**](?path=/story/grid-extending-hooks--overview), so a module still has the last word.

| Callback | What it decides |
|---|---|
| \`onGetCommands\` | The commands a cell offers for its record: \`{ items, overflowItems }\`, drawn while the row is hovered or focused. |
| \`onGetTheme\` | Changes a cell's theme: \`(theme, { record })\`, as \`registerCellThemeHook\` on [**Hooks**](?path=/story/grid-extending-hooks--overview) without the column. Set \`theme.colors\` and the cell's palette is generated from them. |
| \`onGetEditable\` | Decides per record whether a cell can be edited: set \`result.isEditable\`. \`isEditable: false\` still locks the whole column. |
| \`onGetLoading\` | Decides per record whether a cell shows a loading placeholder: set \`result.isLoading\`. |
`

const meta = {
    title: 'Grid/Customizations/Columns',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
            description: { component: DESCRIPTION },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const PinAndAlignColumns: Story = {
    name: 'Pin and align columns',
    render: () => renderStory(<PinAndAlignExample />),
}

export const AddAComputedColumn: Story = {
    name: 'Add a computed column',
    render: () => renderStory(<ComputedColumnExample />),
    parameters: {
        docs: {
            description: {
                story: `A column no provider has, added after the provider's columns: scroll right to **Weighted value**. Its \`cellRenderer\` works out the value from the record, and draws it in the grid's own cell parts.`,
            },
        },
    },
}

export const ActionsColumn: Story = {
    name: 'Actions column',
    render: () => renderStory(<ActionsColumnExample />),
    parameters: {
        docs: {
            description: {
                story: `A column holding nothing but commands. Hover a row: \`items\` are the buttons, \`overflowItems\` sit in the **…** menu.`,
            },
        },
    },
}

export const RememberColumnWidths: Story = {
    name: 'Remember column widths',
    render: () => renderStory(<RememberWidthsExample />),
    parameters: {
        docs: {
            description: {
                story: `\`onColumnsChanged\` hands over the columns after the user resized one. Keep their \`visualSizeFactor\`, and hand it to the provider the next time the grid opens.`,
            },
        },
    },
}
