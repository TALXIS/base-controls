import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { GuideMap } from '../../task-grid/guide/GuideSteps'
import { OfficeMoveExample } from '../../task-grid/examples/overviewExamples'

const DESCRIPTION = `
A task grid shows a plan as a tree of tasks, each task under the one it is part of, with a Gantt chart beside it that draws the same tasks on a timeline. It is for React and Power Apps applications whose users plan work where they see it: they add tasks, rename them, change their dates, drag them about and delete them, and each feature beyond the tree, such as people, dependencies or holidays, is a module you add. Try it below: press *Expand one level* twice, then drag the bar of *Paint the meeting rooms* a week later.

{{canvas: The office move}}

## What you see

| You see | Drawn by | Taught in |
|---|---|---|
| The tree, its chevrons and *Expand one level* | \`TaskGrid\` | [**Your first task grid**](?path=/docs/controls-taskgrid-guide-basics-your-first-task-grid--overview) |
| *New*, *Edit* and *Delete* for the ticked tasks, a row's **+**, and the lock on *Sign the lease* | \`TaskDatasetControl.Ribbon\` and \`TaskGrid\`, with the \`enable…\` props | [**Let users plan**](?path=/docs/controls-taskgrid-guide-basics-let-users-plan--overview) |
| The view switcher, the search box and *Settings* | \`DatasetControl.ViewSwitcher\`, \`DatasetControl.QuickFind\` and \`TaskDatasetControl.Settings\` | [**Views and the tree**](?path=/docs/controls-taskgrid-guide-basics-views-and-the-tree--overview) |
| The bars, the handle between the grid and the chart, the zoom slider, *Zoom to fit* and *Go to today* | \`TaskGantt\`, \`TaskGantt.Split\` and \`TaskGantt.ZoomSlider\` | [**The timeline**](?path=/docs/controls-taskgrid-guide-basics-the-timeline--overview) |
| The pictures in *Assigned to* and the coloured pills in *Tags* | The lookup-many module | [**People and tags**](?path=/docs/controls-taskgrid-guide-features-people-and-tags--overview) |
| The arrows between bars | The links module, over the dependencies module | [**Dependencies and links**](?path=/docs/controls-taskgrid-guide-features-dependencies-and-links--overview) |
| The *done/total* in *Checklist*, on the *Every task* view | The checklist module | [**Checklists and custom columns**](?path=/docs/controls-taskgrid-guide-features-checklists-and-custom-columns--overview) |
| The lines of *Move-in day*, *Opening party* and today, the weekends and Easter days shaded once you zoom in to days, and the tooltip on a bar | The markers, non-working days and tooltip modules | [**Dates on the timeline**](?path=/docs/controls-taskgrid-guide-features-dates-on-the-timeline--overview) |

## How it fits together

\`TaskDatasetControl\` holds the tasks, and \`TaskGrid\` and \`TaskGantt\` draw them. Both draw the same tasks, so a change in one shows in the other at once: drag a row under another task and its bar moves with it, and rename a task in the grid and the tooltip on its bar says the new name.

| Part | Does | Takes |
|---|---|---|
| \`TaskDatasetControl\` | Holds the tasks: loads them through the store \`onLoad\` returns, opens the views, says what the user may change, and lays out the header and the body. It is a [**DatasetControl**](?path=/docs/controls-datasetcontrol-get-started--overview) whose records are tasks. | Task modules, such as lookup many, the checklist and dependencies |
| \`TaskGrid\` | Draws the tasks as a tree, in \`DatasetControl.Body\`. It is a [**Grid**](?path=/docs/controls-grid-get-started--overview), without grouping and totals. | Grid modules, such as editing, row selection and filtering |
| \`TaskGantt\` | Draws the same tasks on a timeline, row for row with the grid, beside it in \`TaskGantt.Split\`. It comes from \`@talxis/base-controls/gantt\`. | Gantt modules, such as dragging bars, links and markers |

[**How modules work**](?path=/docs/controls-taskgrid-guide-features-how-modules-work--overview) says which module goes in which part.

## The guide

The guide builds the office move above one step at a time, from a read-only tree to the dates on the timeline.

{{block: guide}}

On Dataverse or TALXIS? Do *Basics* first, then go on to [**Where tasks are kept**](?path=/docs/controls-taskgrid-guide-your-data-where-tasks-are-kept--overview).

## Words you will meet

| Word | Means | Explained in |
|---|---|---|
| Task | One piece of work in the plan, such as *Book the movers*. | [**Your first task grid**](?path=/docs/controls-taskgrid-guide-basics-your-first-task-grid--overview) |
| Subtask | A task under another task, its parent. | [**Your first task grid**](?path=/docs/controls-taskgrid-guide-basics-your-first-task-grid--overview) |
| Tree | The tasks drawn each under its parent, the subtasks of each in the order of their rank. | [**Your first task grid**](?path=/docs/controls-taskgrid-guide-basics-your-first-task-grid--overview) |
| Rank | The text that sets a task's place among the tasks under the same parent, such as \`0\|100000:\`. | [**Your first task grid**](?path=/docs/controls-taskgrid-guide-basics-your-first-task-grid--overview) |
| Field mapping | Which of your columns hold a task's parent, name and rank, and later its dates. | [**Your first task grid**](?path=/docs/controls-taskgrid-guide-basics-your-first-task-grid--overview) |
| Store | Where the task grid reads the tasks and saves them, such as \`MemoryTaskStore\`. | [**Your first task grid**](?path=/docs/controls-taskgrid-guide-basics-your-first-task-grid--overview) |
| Inactive task | A task whose \`statecode\` is not \`0\`. It is read-only. | [**Let users plan**](?path=/docs/controls-taskgrid-guide-basics-let-users-plan--overview) |
| View | A named way to look at the plan: which tasks, in what order, with which columns. | [**Views and the tree**](?path=/docs/controls-taskgrid-guide-basics-views-and-the-tree--overview) |
| Module | A feature you add by listing it in the \`modules\` of \`TaskDatasetControl\`, \`TaskGrid\` or \`TaskGantt\`. | [**How modules work**](?path=/docs/controls-taskgrid-guide-features-how-modules-work--overview) |
| Task runtime | What \`onLoad\` is handed, through which your code changes the plan as the user does. | [**From your code**](?path=/docs/controls-taskgrid-guide-advanced-from-your-code--overview) |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Your first task grid', iconName: 'Education', href: '?path=/docs/controls-taskgrid-guide-basics-your-first-task-grid--overview', text: 'Start the guide: the office move as a tree, from your own rows.' },
    { title: 'Reference', iconName: 'Table', href: '?path=/docs/controls-taskgrid-reference--overview', text: 'Every prop, module parameter, runtime member and slot.' },
    { title: 'DatasetControl', iconName: 'GridViewSmall', href: '?path=/docs/controls-datasetcontrol-get-started--overview', text: 'The control a TaskDatasetControl is: views, search, Edit columns and state.' },
]

const meta = {
    title: 'Controls/TaskGrid/Overview',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { guide: () => <GuideMap />, explore: () => <ExploreCards cards={EXPLORE} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const TheOfficeMove: Story = {
    name: 'The office move',
    render: () => renderStory(<OfficeMoveExample />),
}
