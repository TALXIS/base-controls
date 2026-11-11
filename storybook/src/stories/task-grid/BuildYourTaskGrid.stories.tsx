import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { TaskGridBuilder } from '../../task-grid/builder'

const DESCRIPTION = `
A task grid shows a plan as a tree of tasks, and this builder puts one together from the store and the features you pick, running beside the code that makes it. Try it below: pick where your tasks are kept, then turn on *Gantt beside the grid*.

{{canvas: Build your task grid}}

## Where next

| Page | Read it to |
|---|---|
| [**Your first task grid**](?path=/docs/controls-taskgrid-guide-your-first-task-grid--overview) | Build the smallest task grid, one line at a time. |
| [**Connect your data**](?path=/docs/controls-taskgrid-guide-connect-your-data--overview) | Load the tasks from memory, Dataverse, TALXIS or your own API. |
| [**Views, tree and editing**](?path=/docs/controls-taskgrid-guide-views-tree-and-editing--overview) | Set up views, and let the user create, edit, move and delete tasks. |
| [**Features**](?path=/docs/controls-taskgrid-guide-features--overview) | Add a project, custom columns, lookups, templates, checklists and dependencies. |
| [**The Gantt**](?path=/docs/controls-taskgrid-guide-the-gantt--overview) | Put the tasks on a timeline beside the grid. |
| [**Make it yours**](?path=/docs/controls-taskgrid-guide-make-it-yours--overview) | Change how the grid and the Gantt look. |
| [**From your code**](?path=/docs/controls-taskgrid-guide-from-your-code--overview) | Do from your code what the user does. |
| [**Reference**](?path=/docs/controls-taskgrid-reference--overview) | Look up every prop, module parameter and runtime member. |
`

const meta = {
    title: 'Controls/TaskGrid/Build your task grid',
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

export const BuildYourTaskGrid: Story = {
    name: 'Build your task grid',
    render: () => renderStory(<TaskGridBuilder />),
}
