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
