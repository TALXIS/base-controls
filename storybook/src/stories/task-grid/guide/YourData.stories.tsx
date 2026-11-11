import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { GuideNavigation } from '../../../task-grid/guide/GuideSteps'
import { DataverseTasksExample, OwnStoreExample, RescheduledDatesExample, StoreCallsExample } from '../../../task-grid/guide/connectYourDataExamples'

const DESCRIPTION = `
A task grid loads its tasks through a store you return from \`onLoad\`. These steps show where the tasks can be kept, what reaches the store, and how to put a store over your own API.

## Where your tasks are kept

\`onLoad\` runs on every mount: when the control opens, when the user picks a view or saves *Edit columns*, and on *Try again*. Return a new store from it each time, and keep the rows themselves outside it. How mounts work is on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview).

| Store | Keeps the tasks |
|---|---|
| \`MemoryTaskStore\` | In a \`MemoryTable\` of plain rows, created once outside the control. Every example in this guide runs on it. |
| \`DataverseTaskStore\` | In a Dataverse table, read through FetchXML that you write as a Liquid template over \`hostRecord\`, the record the grid sits on, and \`project\`. *Edit* opens a task in its form in a side dialog. |
| \`DataverseTaskStore\` in TALXIS | In \`talxis_projecttask\`, with \`createDataverseProjectModule\` naming the project. |

What \`onLoad\` returns, every field mapping key and each store's parameters are on [**Reference**](?path=/docs/controls-taskgrid-reference--overview).

The memory plan runs in the preview, while *dataverse.ts* and *talxis.ts* load the same kind of tasks in a model-driven app.

{{story: Where your tasks are kept}}

## What reaches the store

The store loads every task of the view at once. Sorting, filtering, searching and opening the tree then happen in the page, and only what the user changes goes back to the store.

| The user | The store gets |
|---|---|
| Opens the control, or switches the view | \`load()\`, once |
| Sorts, filters, searches, or opens and closes tasks | Nothing |
| Creates a task | \`createTask()\`, while the new row shows as loading |
| Edits a cell, or drags a task | \`saveTask()\` |
| Deletes tasks | \`deleteTasks()\`, the deepest level first |
| Creates, saves or deletes | \`synchronize()\` afterwards, when the store has it |

Try: rename a task and watch the calls that reach the store.

{{story: What reaches the store}}

## A store over your own API

Implement \`ITaskStore\` over your API and return it from \`onLoad\` as \`store\`. Throw "Not implemented." from a method your backend does not support; every method is on [**Reference**](?path=/docs/controls-taskgrid-reference--overview).

To change one thing a built-in store does, extend it instead: every store is a class, so override \`createTask\` to give new tasks values of their own, or \`canDeleteTask\` to keep some tasks from being deleted.

A store over an API of todos, which creates, saves, moves and deletes through it. Try: drag *Publish the release* onto *Write the release notes*.

{{story: A store over your own API}}

## Dates the backend changes

After every save, creation and deletion, the task grid asks the store through \`synchronize()\` which tasks the backend changed on its own, such as dates it rescheduled, and shows them, keeping the user's unsaved edits. \`DataverseTaskStore\` answers with the tasks modified since its last read; on a store of your own, \`synchronize()\` is optional.

A backend that keeps a parent due with its last subtask. Try: set the *Due* of *Move in* to 10 April.

{{story: Dates the backend changes}}

{{block: navigation}}
`

const meta = {
    title: 'Controls/TaskGrid/Guide/Your data',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { navigation: () => <GuideNavigation current='Your data' /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const WhereYourTasksAreKept: Story = {
    name: 'Where your tasks are kept',
    tags: ['!dev'],
    render: () => renderStory(<DataverseTasksExample />),
}

export const WhatReachesTheStore: Story = {
    name: 'What reaches the store',
    tags: ['!dev'],
    render: () => renderStory(<StoreCallsExample />),
}

export const AStoreOverYourOwnAPI: Story = {
    name: 'A store over your own API',
    tags: ['!dev'],
    render: () => renderStory(<OwnStoreExample />),
}

export const DatesTheBackendChanges: Story = {
    name: 'Dates the backend changes',
    tags: ['!dev'],
    render: () => renderStory(<RescheduledDatesExample />),
}
