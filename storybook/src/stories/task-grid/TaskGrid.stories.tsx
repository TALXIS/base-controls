import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { MemoryTaskGrid } from '../../task-grid/MemoryTaskGrid'

const meta = {
    title: 'Task Grid/Demo',
    parameters: {
        layout: 'fullscreen',
        controls: { disable: true },
        docs: {
            disable: true,
        },
        previewTabs: {
            canvas: { hidden: true },
            'storybook/docs/panel': { hidden: true },
        },
        options: {
            showPanel: false,
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
    name: 'Demo',
    render: () => <MemoryTaskGrid />,
}
