import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { IParsingScratchGridProps, ParsingScratchGrid } from '../../../grid/dev/ParsingScratchGrid'

const meta = {
    title: 'Grid/Dev/Parsing',
    tags: ['dev-only'],
    component: ParsingScratchGrid,
    parameters: {
        docs: {
            disable: true,
        },
    },
} satisfies Meta<typeof ParsingScratchGrid>

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

/** Every data type values are parsed into, with the date behaviors side by side. */
export const Parsing: Story = {
    name: 'Parsing',
    args: {
        enableAutoSave: false,
    },
    render: (args: IParsingScratchGridProps) => <FullPage><ParsingScratchGrid {...args} /></FullPage>,
}
