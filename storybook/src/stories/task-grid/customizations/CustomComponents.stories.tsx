import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { CustomCellRendererExample } from '../../../task-grid/CustomCellRendererExample'
import { CustomCellEditorExample } from '../../../task-grid/CustomCellEditorExample'
import { CustomLookupCellExample } from '../../../task-grid/CustomLookupCellExample'
import { CustomCommandBarExample } from '../../../task-grid/CustomCommandBarExample'

const meta = {
    title: 'Task Grid/Customizations/Custom Components',
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
Replace parts of what the grid renders with your own components while it keeps owning the data, the tree, editing and saving. Flip the **Code** toggle on any story to read its snippet, and edit it: the grid recompiles as you type.

> The stories below use Material UI purely to show that presentation is fully swappable, not because it is the recommended choice. To keep a grid visually coherent, prefer Fluent UI — that is what the rest of the control renders with.

## What you can replace

- **A column's cells** — \`colDefs\`, keyed by column name. A cell is built from the Grid's own parts, so replace only the part you need — usually just the value — and keep loading, validation, commands and editing as they are. See [**Grid → Custom cells**](?path=/docs/grid-appearance-custom-cells--overview).
- **A column's editor** — \`colDefs\` too, through \`cellEditor\`.
- **The command bar** — \`components.onRenderCommandBar\` replaces the header's command bar and hands you Fluent's \`ICommandBarProps\`, its \`items\` being the task grid's commands.
- **The loading skeleton and the error message** — \`components.skeleton\` and \`components.errorMessage\`, the same as on the [**DatasetControl**](?path=/docs/datasetcontrol-appearance--overview).
- **The grid's overlays and rows** — \`components.overlays\` and \`components.rows\`, the same as on the Grid. See [**Grid → Custom overlays**](?path=/docs/grid-appearance-custom-overlays--overview).

The columns a feature brings are columns like any other: \`checklist__virtual\`, \`predecessors__virtual\`, \`successors__virtual\`, and every lookup-many column, are all replaced the same way.

Each story runs its own grid with its own in-memory data, so edits in one do not leak into the next.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const ReplaceCellRenderer: Story = {
    name: 'Replace a cell renderer',
    parameters: {
        docs: {
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                story: `
Renders the **Priority** column as a MUI \`Chip\`, while every other column keeps the cell the grid would have used.

- replaces only the value: \`Grid.Cell.Renderer\` still draws the loading state, the validation error and the commands around it
- reads the label and the raw value from \`useGridField()\`, so it needs no data of its own
                `.trim(),
            },
        },
    },
    render: () => renderStory(<CustomCellRendererExample />),
}

export const RenderLookupColumn: Story = {
    name: 'Render a lookup column',
    parameters: {
        docs: {
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                story: `
Renders **Assigned To** as a MUI \`AvatarGroup\`, and clicking it reassigns the task through a MUI \`Autocomplete\`.

- reads the column's value as one entry per referenced record, and pulls each avatar out of the \`rawData\` the strategy attached to that reference
- gets its candidates from the lookup-many feature — \`useTaskGridRuntime().services.get('lookupManyModule').createDataProvider(...)\` — the same call the built-in picker makes
- a lookup-many column takes input where its cell stands, so the replacement writes the references with \`field.setValue\` and the grid saves them
- these columns render with \`autoHeight\`, so keep the replacement's height predictable or the row grows with it
                `.trim(),
            },
        },
    },
    render: () => renderStory(<CustomLookupCellExample />),
}

export const ReplaceCellEditor: Story = {
    name: 'Replace a cell editor',
    parameters: {
        docs: {
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                story: `
Opens a MUI \`Slider\` when a **% Complete** cell starts editing, instead of the number input. Double-click one to try it.

- \`EditingCell.Editor\` is the grid's own editor with its value replaced, so keyboard handling and closing stay the grid's
- \`field.setValue\` writes the value, and the grid saves it
                `.trim(),
            },
        },
    },
    render: () => renderStory(<CustomCellEditorExample />),
}

export const ReplaceCommandBar: Story = {
    name: 'Replace the command bar',
    parameters: {
        docs: {
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                story: `
Swaps the Fluent command bar for a row of MUI buttons, carrying both the grid's commands and one of its own.

- has no \`defaultRender\`: you get the command model — \`text\`, \`iconProps\`, \`onClick\`, \`subMenuProps\` — and render it however you like
- keeps the grid's panels: a submenu that brings its own content exposes it as \`onRenderMenuList()\`, so the settings callout opens inside the MUI \`Menu\`
- adds **Mark done**, a command of its own, which reaches the grid's data through \`useTaskDataProvider()\` and saves the whole selection in one pass
                `.trim(),
            },
        },
    },
    render: () => renderStory(<CustomCommandBarExample />),
}
