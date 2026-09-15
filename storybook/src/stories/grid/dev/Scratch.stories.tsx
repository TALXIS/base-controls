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
        clipboard: true,
        cellSelection: true,
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
        oneClickEditColumns: 4,
    },
    argTypes: {
        rowModel: { control: 'inline-radio', options: ['serverSide', 'clientSide'] },
        oneClickEditColumns: { control: { type: 'range', min: 0, max: 8 }, description: 'How many of the leading columns take input in the cell itself, with no editor to open.' },
        grouping: { description: 'Fetches a level at a time on the server-side row model, the whole tree on the client-side one.' },
        selectableRows: { control: 'inline-radio', options: ['none', 'single', 'multiple'] },
    },
    render: (args: IScratchGridProps) => (
        <div style={{ padding: 18 }}>
            <ScratchGrid {...args} />
        </div>
    ),
}

/**
 * The same grid over ten thousand rows, which is what says whether a cell is cheap enough.
 *
 * Everything a cell does per render is in play here - its theme, the hooks, the commands, the validation -
 * so scrolling this is the measure of what the cell costs. The modules that hold the whole set in memory
 * are off, because what is being tested is the cells rather than the row model.
 */
export const Stress: Story = {
    name: 'Stress',
    args: {
        ...Playground.args,
        rowCount: 10000,
        grouping: false,
        aggregation: false,
    },
    argTypes: Playground.argTypes,
    render: (args: IScratchGridProps) => (
        <div style={{ padding: 18 }}>
            <ScratchGrid {...args} />
        </div>
    ),
}
