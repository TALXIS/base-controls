import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { MemoryTaskGrid } from '../../task-grid/MemoryTaskGrid'

const meta = {
    title: 'Task Grid/Get started',
    tags: ['autodocs'],
    parameters: {
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
Task Grid is a hierarchical task-management grid built on <a href="https://www.ag-grid.com/" target="_blank" rel="noreferrer">AG Grid</a>.

It renders tasks as a parent–child tree and brings the surrounding behaviour with it: drag-and-drop reordering, inline editing, saved views, quick find, custom columns, and template-based task creation working as one system.

The grid below is real. It runs on the in-memory strategy, so everything you do to it — reorder, edit, create, delete, switch views — is the same code path a production grid uses.

## What you get from the control

- Render a task hierarchy with expand/collapse, without managing tree state yourself.
- Reorder rows by dragging, persisted through fractional ranks rather than reindexing every sibling.
- Keep saved views, quick find, column selection and inline editing coordinated across the grid.
- Swap the data source without touching the UI — the grid never talks to a server directly.

## Headless by design

The control ships no data access at all. Everything — loading, saving, reordering, saved views — is supplied by you through a **descriptor**, which is the single object you hand to the grid:

\`\`\`tsx
import { TaskGrid } from '@talxis/base-controls'

export const MyTaskGridPage = ({ pcfContext }) => (
    <TaskGrid
        pcfContext={pcfContext}
        taskGridDescriptor={descriptor}
    />
)
\`\`\`

The descriptor returns the strategies the grid asks for, and the grid calls them at the right moments. See [**Descriptor**](?path=/story/task-grid-descriptors-strategies-descriptor--overview) for the contract itself.

### \`<TaskGrid />\` props

| Prop | Required | Description |
|------|:--------:|-------------|
| \`pcfContext\` | ✅ | A \`ComponentFramework.Context\`. Used for navigation, formatting, error dialogs and environment utilities. |
| \`taskGridDescriptor\` | ✅ | Your \`ITaskGridDescriptor\`. The single entry point for all data access and configuration. |
| \`labels?\` | — | Partial \`ITaskGridLabels\`. Any key you supply replaces the English default. |
| \`components?\` | — | Partial \`ITaskGridComponents\`. Replaces the skeleton loader or the command bar. |

## Choose a strategy

Two descriptor implementations ship with the package. Both satisfy the same contract, so the grid behaves identically — they differ only in where the records come from.

### Memory

Choose this when the data lives in your own process and you want the grid running with no backend at all.

This is the best fit when:

- you are developing locally, writing tests, or building a demo
- you have records in hand already and just want them rendered
- you want a working reference implementation to read before writing your own

Go to [**Memory**](?path=/story/task-grid-descriptors-strategies-memory--overview).

### Dataverse

Choose this when tasks are Dataverse rows and the grid should behave like a model-driven subgrid.

This is the best fit when:

- the task entity lives in Dataverse and is queried with FetchXML
- you want saved views persisted per user, and forms opened for create/edit
- you need relationship columns handled with associate/disassociate on save

Go to [**Dataverse**](?path=/story/task-grid-descriptors-strategies-dataverse--overview).

> Neither is a subclassing exercise. Both are configured entirely through a parameter object — you only write a strategy when you have a data source neither covers, which is what [**Writing your own strategy**](?path=/story/task-grid-descriptors-strategies-writing-your-own-strategy--overview) walks through.

## Where to go next

- [**Descriptor**](?path=/story/task-grid-descriptors-strategies-descriptor--overview) — the contract every strategy plugs into.
- [**Customizations**](?path=/story/task-grid-customizations--overview) — feature flags, cell renderers, labels, and replaceable UI.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
    name: 'Overview',
    render: () => renderStory(<MemoryTaskGrid />),
}
