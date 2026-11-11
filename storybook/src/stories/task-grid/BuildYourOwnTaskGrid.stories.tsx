import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { BuildBackendStepExample, BuildGanttStepExample, BuildModulesStepExample, BuildPlanStepExample, BuildTasksStepExample, BuildViewsStepExample } from '../../task-grid/examples/buildYourOwnExamples'

const DESCRIPTION = `
This guide builds a task grid over a plan of your own, one step at a time: your rows in memory first, then views, editing, modules and a Gantt, and last the same grid on Dataverse or TALXIS. Each step is a live example that grows the one before it, marks what it adds with \`new\` in its comments, and links to the page that says more. Try it below: change an \`owner\` in *office.ts*, the plan every step draws.

{{canvas: Step 1: Your tasks in memory}}

## Your tasks in memory

A task grid needs your rows, the columns that make the tree, and a store over them. *office.ts* holds the rows and their columns; the entry maps the columns and returns a \`MemoryTaskStore\` from \`onLoad\`, as its comments number. More on [**Loading tasks**](?path=/docs/controls-taskgrid-loading-tasks--overview); the root providers the control sits under are on [**Quick start**](?path=/docs/concepts-quick-start--overview).

## Views

Views sort, filter and search the tree, or list the tasks without it. Return them from \`onLoad\`, and add the view switcher, quick find and settings to the header: see [**Views and the tree**](?path=/docs/controls-taskgrid-views-and-the-tree--overview).

{{story: Step 2: Views}}

## Let the user plan

The \`enable…\` props turn on *New*, *Edit* and *Delete*, and three modules do the rest: row selection and editing on the grid, dragging on the control. See [**Working with tasks**](?path=/docs/controls-taskgrid-working-with-tasks--overview).

{{story: Step 3: Let the user plan}}

## Add modules

Modules bring what tasks carry beside their own columns, here dependencies and checklists kept in memory, and a view lists their columns by name. Every module, with its memory, Dataverse and TALXIS variants, is on [**Modules**](?path=/docs/controls-taskgrid-modules--overview).

{{story: Step 4: Add modules}}

## Put a Gantt beside the grid

\`TaskGantt.Split\` draws the grid and the timeline row for row, and the Gantt takes modules of its own. The project module gives the timeline the plan's start and end. See [**Gantt**](?path=/docs/controls-taskgrid-gantt-get-started--overview).

{{story: Step 5: A Gantt beside the grid}}

## Move to Dataverse or TALXIS

Put the backend in a file of its own, so moving to another one changes only that file. *memory.ts* runs here; *dataverse.ts* exports the same two values over tables of your own in Dataverse, and *talxis.ts* over the TALXIS tables, which its modules already know. Neither runs on this page: in your app, such as a PCF control in a model-driven app, import one of them in place of *memory.ts*.

{{story: Step 6: One backend per file}}

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Loading tasks', iconName: 'CloudDownload', href: '?path=/docs/controls-taskgrid-loading-tasks--overview', text: 'Every store, and a store of your own over your API.' },
    { title: 'Write a module', iconName: 'Puzzle', href: '?path=/docs/controls-taskgrid-write-a-module--overview', text: 'Add a rule of your business to the plan.' },
    { title: 'Talking to the task grid', iconName: 'Plug', href: '?path=/docs/controls-taskgrid-talking-to-the-task-grid--overview', text: 'Drive the plan from buttons, commands and modules of your own.' },
]

const meta = {
    title: 'Controls/TaskGrid/Build your own task grid',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { explore: () => <ExploreCards cards={EXPLORE} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const StepOneTasks: Story = {
    name: 'Step 1: Your tasks in memory',
    render: () => renderStory(<BuildTasksStepExample />),
}

export const StepTwoViews: Story = {
    name: 'Step 2: Views',
    render: () => renderStory(<BuildViewsStepExample />),
    parameters: {
        docs: {
            description: {
                story: `Three views of the plan, with search and the settings menu. Try: open *Next up*, then search for *paint*.`,
            },
        },
    },
}

export const StepThreePlan: Story = {
    name: 'Step 3: Let the user plan',
    render: () => renderStory(<BuildPlanStepExample />),
    parameters: {
        docs: {
            description: {
                story: `The plan, ready to change. Try: drag *Book the movers* onto *Fit out the space*.`,
            },
        },
    },
}

export const StepFourModules: Story = {
    name: 'Step 4: Add modules',
    render: () => renderStory(<BuildModulesStepExample />),
    parameters: {
        docs: {
            description: {
                story: `Dependencies and checklists beside the tasks. Try: remove \`createMemoryTaskChecklistModule\` from \`controlModules\`, and its column goes with it.`,
            },
        },
    },
}

export const StepFiveGantt: Story = {
    name: 'Step 5: A Gantt beside the grid',
    render: () => renderStory(<BuildGanttStepExample />),
    parameters: {
        docs: {
            description: {
                story: `The plan on a timeline, its dependencies drawn as links. Try: drag the bar of *Install the network* to another week.`,
            },
        },
    },
}

export const StepSixBackend: Story = {
    name: 'Step 6: One backend per file',
    render: () => renderStory(<BuildBackendStepExample />),
    parameters: {
        docs: {
            description: {
                story: `The same task grid, its backend in *memory.ts*, with *dataverse.ts* and *talxis.ts* beside it for Dataverse and TALXIS.`,
            },
        },
    },
}
