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

/** The chain from the viewport down to the grid, so `height: 100%` on the grid means the page. */
const FullPage = (props: { children?: React.ReactNode }) => <>
    <style>{`
        html, body, #storybook-root { height: 100%; margin: 0; }
        #storybook-root, #storybook-root > div, #storybook-root > div > div { display: flex; flex-direction: column; flex: 1; min-height: 0; }
    `}</style>
    {props.children}
</>

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
        oneClickEdit: true,
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
    render: (args: IScratchGridProps) => <FullPage><ScratchGrid {...args} /></FullPage>,
}

/**
 * The same grid over ten thousand rows, which is what says whether a cell is cheap enough.
 *
 * Everything a cell does per render is in play here - its theme, the hooks, the commands, the validation -
 * so scrolling this is the measure of what the cell costs. Grouping and aggregation are on, so grouping and
 * totalling the whole set are measured too.
 */
export const Stress: Story = {
    name: 'Stress',
    args: {
        ...Playground.args,
        rowCount: 10000,
    },
    argTypes: Playground.argTypes,
    render: (args: IScratchGridProps) => <FullPage><ScratchGrid {...args} /></FullPage>,
}
