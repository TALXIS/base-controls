import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { GanttTaskGrid } from '../../../task-grid/dev/GanttTaskGrid'

const meta = {
    title: 'Task Grid/Dev/Gantt',
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
 * The memory fixtures the gantt module is developed against, with the module itself left out for now - so
 * this is the grid on its own until `onGetGanttModule` is registered again in `GanttTaskGrid`.
 */
export const Timeline: Story = {
    name: 'Timeline beside the grid',
    render: () => <GanttTaskGrid />,
}

/**
 * The same thing over 10 000 generated tasks, off the fixed seed the large-dataset story uses — so a
 * measurement here is comparable with the grid on its own.
 */
export const TenThousandTasks: Story = {
    name: '10 000 tasks',
    //the whole viewport, no padding: as many rows on screen as the grid will render
    render: () => (
        <div style={{ height: '100vh' }}>
            <GanttTaskGrid count={10_000} seed={42} height="100%" />
        </div>
    ),
}
