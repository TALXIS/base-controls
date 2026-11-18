import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { GanttDateTimeTaskGrid, GanttTaskGrid } from '../../../task-grid/dev/GanttTaskGrid'
import { GanttStressTaskGrid } from '../../../task-grid/dev/GanttStressTaskGrid'
import { FlakyGanttTaskGrid } from '../../../task-grid/dev/FlakyGanttTaskGrid'

const meta = {
    title: 'Dev/TaskGrid/Gantt',
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

/** The Core tasks with the Gantt beside the grid and every Gantt module, over date-only dates. */
export const Gantt: Story = {
    name: 'Gantt (date only)',
    parameters: { layout: 'fullscreen' },
    render: () => <div style={{ height: '100vh', padding: 18, boxSizing: 'border-box' }}><GanttTaskGrid /></div>,
}

/** The same Gantt over dates with a time of day. */
export const GanttDateTime: Story = {
    name: 'Gantt (date and time)',
    parameters: { layout: 'fullscreen' },
    render: () => <div style={{ height: '100vh', padding: 18, boxSizing: 'border-box' }}><GanttDateTimeTaskGrid /></div>,
}

/** The Gantt over 10,000 generated tasks, with every Gantt module. */
export const GanttStress: Story = {
    name: 'Stress (10k tasks)',
    parameters: { layout: 'fullscreen' },
    render: () => <div style={{ height: '100vh', padding: 18, boxSizing: 'border-box' }}><GanttStressTaskGrid /></div>,
}

/** A Gantt whose modules fail to load about every other time, to watch the runtimes' ready and failure. */
export const GanttFlaky: Story = {
    name: 'Flaky Gantt load',
    parameters: { layout: 'fullscreen' },
    render: () => <div style={{ height: '100vh', padding: 18, boxSizing: 'border-box' }}><FlakyGanttTaskGrid /></div>,
}
