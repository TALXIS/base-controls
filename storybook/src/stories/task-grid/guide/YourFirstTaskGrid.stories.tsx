import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { PlannerTaskGridExample, SmallestTaskGridExample } from '../../../task-grid/guide/yourFirstTaskGridExamples'

const DESCRIPTION = `
A task grid shows a plan as a tree of tasks, each under its parent and in its place among its siblings, and lets the user build the plan where they see it: add tasks, rename them, drag them about and delete them. On this page you build one in two steps, first the smallest task grid that shows your tasks, then one the user can plan in. Try it below: add \`enableCreation\` to \`TaskDatasetControl\` in **Code**, then press **+** on a row.

{{canvas: The smallest task grid}}

## The smallest task grid

A task grid needs three things: your rows, a *store* that keeps them, and a *field mapping* that names the columns making the tree. \`TaskDatasetControl\` calls \`onLoad\` for both, and \`TaskGrid\` in its body draws the tasks. Open **Code**: its comments walk through each line, and *office.ts* holds the rows.

Like every control, it needs the root providers from [**Quick start**](?path=/docs/concepts-quick-start--overview).

## A task grid to plan in

The same plan, now with views to switch between, a search box, the ribbon and the settings menu in the header, and the user allowed to create, edit, move and delete tasks. The comments mark each addition with \`new\`.

{{story: A task grid to plan in}}

## Built on DatasetControl and Grid

\`TaskDatasetControl\` is a DatasetControl whose records are tasks, and \`TaskGrid\` is a Grid that draws them as a tree, so their pages apply here too: views, quick find, *Edit columns*, layout and state on [**DatasetControl**](?path=/docs/controls-datasetcontrol-get-started--overview), and columns, sorting, filtering and selection on [**Grid**](?path=/docs/controls-grid-get-started--overview). The task grid adds \`TaskDatasetControl.Ribbon\`, \`TaskDatasetControl.Settings\` and \`TaskDatasetControl.PageSizeSwitcher\`, edits cells with \`createTaskEditingModule()\` in place of the Grid's editing module, and leaves out grouping and totals.

## Where next

**Next:** [**Connect your data**](?path=/docs/controls-taskgrid-guide-connect-your-data--overview)
`

const meta = {
    title: 'Controls/TaskGrid/Guide/Your first task grid',
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

export const TheSmallestTaskGrid: Story = {
    name: 'The smallest task grid',
    render: () => renderStory(<SmallestTaskGridExample />),
}

export const ATaskGridToPlanIn: Story = {
    name: 'A task grid to plan in',
    render: () => renderStory(<PlannerTaskGridExample />),
    parameters: {
        docs: {
            description: {
                story: `Views, search, the ribbon and the settings over the same plan, with every change allowed. Try: click **New**, type a name and press Enter.`,
            },
        },
    },
}
