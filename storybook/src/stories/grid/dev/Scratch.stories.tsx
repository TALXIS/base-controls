import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { IScratchGridProps, ScratchGrid } from '../../../grid/dev/ScratchGrid'

const meta = {
    title: 'Grid/Dev/Scratch',
    tags: ['dev-only'],
    component: ScratchGrid,
    parameters: {
        docs: {
            disable: true,
        },
    },
} satisfies Meta<typeof ScratchGrid>

export default meta

type Story = StoryObj<typeof meta>

/**
 * The shared `Grid` on its own, over an in-memory dataset. Every setting is a control, so what each one
 * does to the grid can be seen without a dataset control or a host around it.
 */
export const Playground: Story = {
    name: 'Playground',
    args: {
        rowModel: 'serverSide',
        clipboard: false,
        enableEditing: true,
        enableAutoSave: true,
        enableNavigation: true,
        enableZebra: true,
        enableOptionSetColors: true,
        sorting: true,
        filtering: true,
        grouping: true,
        aggregation: true,
        selectableRows: 'multiple',
    },
    argTypes: {
        rowModel: { control: 'inline-radio', options: ['serverSide', 'clientSide'] },
        grouping: { description: 'Fetches a level at a time on the server-side row model, the whole tree on the client-side one.' },
        selectableRows: { control: 'inline-radio', options: ['none', 'single', 'multiple'] },
    },
    render: (args: IScratchGridProps) => (
        <div style={{ padding: 18 }}>
            <ScratchGrid {...args} />
        </div>
    ),
}
