import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { CUSTOM_CELL_RENDERER_CODE, CustomCellRendererExample } from '../../../task-grid/CustomCellRendererExample'
import { CUSTOM_CELL_EDITOR_CODE, CustomCellEditorExample } from '../../../task-grid/CustomCellEditorExample'

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
Replace parts of what the grid renders with your own components, while the grid keeps owning the data, the tree, editing and saving.

Everything here goes through one prop — \`components\` — whose keys the grid merges over its own defaults:

\`\`\`tsx
<TaskGrid
    pcfContext={pcfContext}
    taskGridDescriptor={descriptor}
    components={{
        onRenderCellRenderer: (props, defaultRender) => …,
        onRenderCellEditor: (props, defaultRender) => …,
        onRenderSkeleton: (props) => <MySpinner height={props.height} />,
        onRenderCommandBar: (props) => <MyCommandBar {...props} />,
    }}
/>
\`\`\`

| Key | Replaces |
|---|---|
| \`onRenderCellRenderer\` | The renderer of any data cell. |
| \`onRenderCellEditor\` | The editor of any editable data cell. |
| \`onRenderSkeleton\` | The loading skeleton shown before the grid mounts. |
| \`onRenderCommandBar\` | The ribbon's command bar. |

Any key you omit keeps its default. For other kinds of customization — feature flags, column metadata, the AG Grid customizer, labels — see [**Customizations**](?path=/story/task-grid-customizations--overview).

## The cell hooks and \`defaultRender\`

The two cell hooks are called for **every** data column, which is why they get a second argument. \`defaultRender\` renders whatever that column would otherwise have used — the base cell, the group cell on \`subject\`, \`PercentComplete\`, the lookup-many renderer, or a component your grid customizer assigned. Switch on \`props.baseColumn?.name\` and delegate the rest:

\`\`\`tsx
onRenderCellRenderer: (props, defaultRender) => props.baseColumn?.name === 'priority'
    ? <PriorityCell {...props} />
    : defaultRender(props)
\`\`\`

Both hooks receive \`ITaskGridCellProps\` — AG Grid's \`ICellRendererParams\` plus the \`record\`, \`baseColumn\`, \`value\` and \`isCellEditor\` the grid injects. It is the same type the built-in renderers use, so a component written for one place works in the other.

Three things to know:

- **They are the outermost layer.** \`components\` wraps the grid customizer, not the other way round — the customizer belongs to the descriptor (your app's wiring), this prop to whoever renders \`<TaskGrid />\`.
- **Not every column reaches them.** The checkbox and add-task columns are skipped, because their props carry no record. Lookup-many columns are not editable — editing happens inside the picker — so \`onRenderCellEditor\` never fires for them, and they render with \`autoHeight\`, so a fixed-height wrapper will fight row sizing.
- **Keep the map and the components stable.** The grid merges \`components\` on every render and AG Grid keys cell components by identity, so declare the object and your renderers at module scope (or memoize them) rather than inline in JSX.

> The hooks do not care which design system you use — the example below deliberately drops a Material UI \`Chip\` into a Fluent grid to show that. In a real app, matching the surrounding Fluent styling usually reads better than mixing the two.
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
            source: {
                code: CUSTOM_CELL_RENDERER_CODE,
            },
            description: {
                story: `
The **Priority** column below renders as a coloured pill instead of the default option-set cell. Everything else is untouched: **Subject** keeps its tree chevrons, **% Complete** keeps its progress bar, and **Assigned To** / **Tags** keep their pickers — all of them arrive through \`defaultRender\`.

The renderer is a MUI \`Chip\` — the label comes off the column definition the grid already passed in, the colour off MUI's palette, and nothing needs styling of its own. Flip the **Code** toggle to read it, and edit it: the grid below recompiles as you type.

Note the \`props.value.loading\` branch: a cell whose value is still resolving is handed back to the grid, which already knows how to show that state. Sorting, filtering and inline editing on the column keep working — the hook only changes what the cell looks like.

The sandbox hands the snippet its \`descriptor\` and \`pcfContext\`, so the in-memory data survives your edits, and it exposes a handful of MUI components (\`Chip\`, \`Stack\`, \`Avatar\`, \`LinearProgress\`, \`Rating\`, \`Tooltip\`, \`Typography\`) to build with. Define a component called \`TaskGridExample\` and it gets rendered.
                `.trim(),
            },
        },
    },
    render: () => renderStory(<CustomCellRendererExample />),
}

export const ReplaceCellEditor: Story = {
    name: 'Replace a cell editor',
    parameters: {
        docs: {
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            source: {
                code: CUSTOM_CELL_EDITOR_CODE,
            },
            description: {
                story: `
Double-click a **% Complete** cell below: instead of the built-in cell it opens a MUI \`Slider\`. Every other column still opens the editor the grid would have used, because they go straight to \`defaultRender\`.

An editor owns its own commit. There is no AG Grid editor value contract here — write the value onto the record, save it, and close the editor:

\`\`\`tsx
const commit = () => {
    props.record.setValue(columnName, value)
    props.record.save()
    props.api?.stopEditing()
}
\`\`\`

The grid auto-saves, so \`record.save()\` routes straight to your strategy's \`onRecordSave\` — the same path an inline edit of any other column takes. This is exactly what the built-in \`LookupManyCellRenderer\` does when its picker closes.

Two things this story shows about the editor hook:

- **\`defaultRender\` is not always a text box.** \`% Complete\` carries a \`PercentComplete\` custom control for both roles, so delegating here hands you the progress bar, not the base cell.
- **Some columns never reach it.** \`Assigned To\` and \`Tags\` are lookup-many, which the grid marks non-editable because editing happens inside their picker — try double-clicking one and the hook stays silent.
                `.trim(),
            },
        },
    },
    render: () => renderStory(<CustomCellEditorExample />),
}
