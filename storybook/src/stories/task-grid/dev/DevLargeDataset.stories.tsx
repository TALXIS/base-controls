import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { LargeTaskGrid } from '../../../task-grid/dev/LargeTaskGrid'

const meta = {
    title: 'Task Grid/Dev/Large dataset',
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
 * 10 000 tasks in a three-level hierarchy, generated with faker off a fixed seed. Expand a few epics
 * and scroll: this is the story to profile against.
 */
export const TenThousandTasks: Story = {
    name: '10 000 tasks',
    //the whole viewport, no padding: profiling wants as many rows on screen as the grid will render
    render: () => (
        <div style={{ height: '100vh' }}>
            <LargeTaskGrid count={10_000} seed={42} />
        </div>
    ),
}
