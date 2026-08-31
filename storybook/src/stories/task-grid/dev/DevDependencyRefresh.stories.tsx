import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { DependencyRefreshTaskGrid } from '../../../task-grid/dev/DependencyRefreshTaskGrid'

const meta = {
    title: 'Task Grid/Dev/Dependency refresh',
    tags: ['dev-only'],
    parameters: {
        controls: { disable: true },
        docs: {
            disable: true,
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

/**
 * Two things to poke at here.
 *
 * **Refresh, one task at a time.** A dependency has two ends, so refreshing one task changes two rows.
 * Link the epics and refresh only the successor: `onAfterDependenciesRefreshed` reports both task ids and
 * the predecessor's *Successors* cell repaints, without its row ever being refreshed.
 *
 * **Delete.** Nothing in the story refreshes anything — `MemoryTaskDependencyStrategy` hears
 * `onAfterTasksDeleted` through the service locator, splices the rows that pointed at the deleted task out
 * of the fixture array, and refreshes the provider itself. Deleting *Frontend Development* is the
 * interesting one: it carries three shipped fixture dependencies, so the cells on *UX/UI Design*,
 * *Content Migration* and *Launch & QA* should all clear.
 *
 * The grid's own factory always refreshes with every record it loaded, so the per-task path is not
 * reachable from the UI — hence a dev story rather than a documented example.
 */
export const FarEndpoint: Story = {
    name: 'Far endpoint repaint',
    render: () => <DependencyRefreshTaskGrid />,
}
