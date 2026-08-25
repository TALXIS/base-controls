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
 * Refreshing one task's dependencies changes two rows, because a dependency has two ends. Link the two
 * epics and refresh only the successor: `onAfterDependenciesRefreshed` reports both task ids, and the
 * predecessor's *Successors* cell repaints without its row ever being refreshed.
 *
 * Then delete the successor. Nothing in the story asks for a refresh — the provider reaches the task
 * side through the service locator, hears `onAfterTasksDeleted`, and refreshes the deleted task itself,
 * which is what clears the predecessor's cell.
 *
 * The grid's own factory always refreshes with every record it loaded, so the per-task path is not
 * reachable from the UI — hence a dev story rather than a documented example.
 */
export const FarEndpoint: Story = {
    name: 'Far endpoint repaint',
    render: () => <DependencyRefreshTaskGrid />,
}
