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
 * The gantt module over the memory fixtures: the grid on the left, the timeline on the right.
 *
 * Things to poke at — the panel divider, the zoom slider left of the ribbon, *Zoom to fit* and *Go to
 * today* in the ribbon, *Hide weekends* in the gear callout, scrolling and expanding on either side
 * (both should follow), dragging and resizing a bar (writes the dates back), and dragging across empty
 * timeline space (creates a task spanning what was dragged).
 */
export const Timeline: Story = {
    name: 'Timeline beside the grid',
    render: () => <GanttTaskGrid />,
}

/**
 * The same thing over 10 000 generated tasks, off the fixed seed the large-dataset story uses — so a
 * measurement here is comparable with the grid on its own.
 *
 * What this story is for: how long the chart takes to parse the tasks the grid loaded, and whether
 * expanding, scrolling and *Zoom to fit* still behave when the timeline holds all of them.
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
