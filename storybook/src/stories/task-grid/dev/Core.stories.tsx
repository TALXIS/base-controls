import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CoreTaskGrid } from '../../../task-grid/dev/CoreTaskGrid'
import { StressTaskGrid } from '../../../task-grid/dev/StressTaskGrid'

const meta = {
    title: 'TaskGrid/Dev/Core',
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

/** The tree over 108 memory tasks, with three views, the ribbon, quick find, edit columns and the settings. */
export const Core: Story = {
    name: 'Core',
    render: () => <div style={{ padding: 18 }}><CoreTaskGrid /></div>,
}

/** The same grid over 10,000 generated tasks, up to eight levels deep, as a stress test. */
export const Stress: Story = {
    name: 'Stress (10k tasks)',
    parameters: { layout: 'fullscreen' },
    render: () => <div style={{ height: '100vh', padding: 18, boxSizing: 'border-box' }}><StressTaskGrid /></div>,
}
