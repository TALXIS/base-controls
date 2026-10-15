import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { CoreTaskGrid } from '../../../task-grid/dev/CoreTaskGrid'

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
