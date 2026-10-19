import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { UserQueriesDatasetControl } from '../../../dataset-control/dev/UserQueriesDatasetControl'

const meta = {
    title: 'DatasetControl/Dev/User queries',
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

/** The deals with the user queries module: Save as new view and Manage views in the view switcher, kept in memory. */
export const Playground: Story = {
    name: 'Playground',
    render: () => <div style={{ padding: 18 }}><UserQueriesDatasetControl /></div>,
}
