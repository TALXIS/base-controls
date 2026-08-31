import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ScratchCheckList } from '../../../check-list/dev/ScratchCheckList'

const meta = {
    title: 'Checklist/Dev/Scratch',
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
 * The `CheckList` control over an in-memory provider. Rows come out of the source shuffled, so the
 * ordering you see is the field mapping's stack-rank sort.
 */
export const Playground: Story = {
    name: 'Playground',
    render: () => (
        <div style={{ padding: 18 }}>
            <ScratchCheckList />
        </div>
    ),
}
