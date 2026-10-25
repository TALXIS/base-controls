import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { GanttTaskGrid } from '../../../task-grid/dev/GanttTaskGrid'
import { GanttStressTaskGrid } from '../../../task-grid/dev/GanttStressTaskGrid'

const meta = {
    title: 'TaskGrid/Dev/Gantt',
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

/** The Core tasks with the Gantt beside the grid and every Gantt module. */
export const Gantt: Story = {
    name: 'Gantt',
    parameters: { layout: 'fullscreen' },
    render: () => <div style={{ height: '100vh', padding: 18, boxSizing: 'border-box' }}><GanttTaskGrid /></div>,
}

/** The Gantt over 10,000 generated tasks, with every Gantt module. */
export const GanttStress: Story = {
    name: 'Stress (10k tasks)',
    parameters: { layout: 'fullscreen' },
    render: () => <div style={{ height: '100vh', padding: 18, boxSizing: 'border-box' }}><GanttStressTaskGrid /></div>,
}
