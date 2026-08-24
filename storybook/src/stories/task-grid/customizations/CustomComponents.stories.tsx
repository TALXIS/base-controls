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
Replace parts of what the grid renders with your own components while it keeps owning the data, the tree, editing and saving.

Everything goes through one prop — \`components\` — whose keys the grid merges over its own defaults. Flip the **Code** toggle on any story to read its snippet, and edit it: the grid recompiles as you type.

These hooks are a convenience layer over the [**Customizer**](?path=/story/task-grid-modules-customizer--overview), which is the lowest level and can do all of this and more: a cell renderer is ultimately \`colDef.cellRenderer\`, which a customizer strategy can set directly. What you get here instead is no strategy to wire, no column definition to find, and the grid's own component handed back as \`defaultRender\` — which is what makes overriding one column cheap.

> The stories below use Material UI purely to show that presentation is fully swappable, not because it is the recommended choice. To keep a grid visually coherent, prefer Fluent UI — that is what the rest of the control renders with.

## What you can replace

- **Cell renderers** — \`onRenderCellRenderer\` wraps every data cell, and \`defaultRender(props)\` gives you back whatever that column would otherwise have rendered.
- **Cell editors** — \`onRenderCellEditor\`, the same contract for the cells the grid lets you edit.
- **The command bar** — \`onRenderCommandBar\` replaces the ribbon's bar outright and hands you the command model.
- **The loading skeleton** — \`onRenderSkeleton\`, shown while the grid boots.

Both cell hooks receive \`ITaskGridCellProps\`: the AG Grid params plus the \`record\`, \`baseColumn\`, \`value\` and \`isCellEditor\` the grid injects, so a component written for one role works in the other.

Treat \`baseColumn\` as optional. Some cells have no column behind them — the selection checkbox and the expand/collapse column are rendered by the grid itself — so a renderer that might be used outside these hooks should read \`props.baseColumn?.name\` rather than assume it is there.

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

- takes the label and the colour from the column definition the grid passes in, so the renderer needs no data of its own
- hands every other column — and this one while its value is still loading — to \`defaultRender\`
- never sees the checkbox and add-task columns: their props carry no record
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
- gets its candidates from \`useTaskGridDatasetControl().createLookupManyDataProvider({ record, column })\` — the same call the built-in picker makes, so the options come from wherever your descriptor says they live
- owns editing too: a lookup-many column is not editable through AG Grid, it is edited *inside* the renderer, so the replacement writes references back with \`record.setValue\` and saves
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
Opens a MUI \`Slider\` when a **% Complete** cell starts editing, instead of the built-in cell. Double-click one to try it.

- commits by itself — \`record.setValue\`, \`record.save()\`, then \`api.stopEditing()\`; there is no AG Grid editor value contract in play
- \`defaultRender\` hands back the column's own component, which here is the progress bar rather than a text box
- never fires for **Assigned To** or **Tags**: lookup-many columns are not editable, they edit inside their picker
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
