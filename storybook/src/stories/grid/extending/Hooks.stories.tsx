import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { ConditionalFormattingExample, EditablePerRecordExample, RowHeightExample, ColumnMenuItemsExample, HeaderAdornmentsExample, CellCommandsExample, ColumnDefinitionsExample } from '../../../grid/examples/hooksExamples'

const DESCRIPTION = `
Each example below registers one hook from a small module. The list of hooks and their services is on [**Extending**](?path=/story/grid-extending--overview).

A hook is called for every cell, row, column or header it covers, and again whenever the grid redraws it. Keep it quick, and return early from what it leaves alone.
`

const meta = {
    title: 'Grid/Extending/Hooks',
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

export const ConditionalFormatting: Story = {
    name: 'Conditional formatting',
    render: () => renderStory(<ConditionalFormattingExample />),
    parameters: {
        docs: {
            description: {
                story: `\`registerCellThemeHook\` recolours overdue **Due** cells. Set \`theme.colors\` and the cell's palette is generated from them.`,
            },
        },
    },
}

export const EditablePerRecord: Story = {
    name: 'Editable per record',
    render: () => renderStory(<EditablePerRecordExample />),
    parameters: {
        docs: {
            description: {
                story: `\`registerCellEditableHook\` locks tasks that are done. The rest of the grid stays editable.`,
            },
        },
    },
}

export const RowHeightPerRecord: Story = {
    name: 'Row height per record',
    render: () => renderStory(<RowHeightExample />),
    parameters: {
        docs: {
            description: {
                story: `\`registerRowHeightHook\` draws tasks that are done in shorter rows.`,
            },
        },
    },
}

export const ColumnMenuItems: Story = {
    name: 'Column menu items',
    render: () => renderStory(<ColumnMenuItemsExample />),
    parameters: {
        docs: {
            description: {
                story: `\`registerColumnMenuItemsHook\` adds an item to every column's menu, after the sorting module's.`,
            },
        },
    },
}

export const HeaderAdornments: Story = {
    name: 'Header adornments',
    render: () => renderStory(<HeaderAdornmentsExample />),
    parameters: {
        docs: {
            description: {
                story: `\`registerColumnHeaderAdornmentsHook\` draws an icon after the **Budget** header's name. \`title\` is added to the header's tooltip.`,
            },
        },
    },
}

export const CellCommandsFromAModule: Story = {
    name: 'Cell commands from a module',
    render: () => renderStory(<CellCommandsExample />),
    parameters: {
        docs: {
            description: {
                story: `\`registerCellCommandsHook\` offers **Done** in the **Task** cell of every task that is not done yet. Hover a row to see it. For commands one column declares itself, use \`onGetCommands\` on {COLUMNS}.`,
            },
        },
    },
}

export const ChangingColumnDefinitions: Story = {
    name: 'Changing column definitions',
    render: () => renderStory(<ColumnDefinitionsExample />),
    parameters: {
        docs: {
            description: {
                story: `\`registerColumnDefinitionsHook\` is handed every column definition before AG Grid gets them: this one drops **Billable** and pins **Task**.`,
            },
        },
    },
}
