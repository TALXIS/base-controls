import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ScratchDatasetControl } from '../../../dataset-control/dev/ScratchDatasetControl'

const meta = {
    title: 'DatasetControl/Dev/Scratch',
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

/** Every part of `DatasetControl` over a deals provider with three views, one of them a personal view. */
export const Playground: Story = {
    name: 'Playground',
    render: () => <div style={{ padding: 18 }}><ScratchDatasetControl /></div>,
}

/** The same control with a view switcher command, an Edit Columns column command and a notification added through `components`. */
export const SlotOverrides: Story = {
    name: 'Slot overrides',
    render: () => <div style={{ padding: 18 }}><ScratchDatasetControl overrideSlots /></div>,
}
