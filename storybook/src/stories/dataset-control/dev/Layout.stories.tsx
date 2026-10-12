import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ILayoutDatasetControlProps, LayoutDatasetControl } from '../../../dataset-control/dev/LayoutDatasetControl'

const meta = {
    title: 'DatasetControl/Dev/Layout',
    tags: ['dev-only'],
    component: LayoutDatasetControl,
    parameters: {
        //the toggles live in the controls panel, which the preview hides by default
        options: { showPanel: true },
        docs: {
            disable: true,
        },
    },
    argTypes: {
        ribbon: { control: 'inline-radio', options: ['none', 'start', 'end'] },
        pagination: { control: 'inline-radio', options: ['none', 'start', 'end'] },
        pageSizeSwitcher: { control: 'inline-radio', options: ['none', 'start', 'end'] },
        extraButtons: { control: { type: 'range', min: 0, max: 3, step: 1 } },
        width: { control: 'inline-radio', options: ['100%', '600px', '420px', '320px'] },
    },
    args: {
        viewSwitcher: true,
        ribbon: 'end',
        editColumns: true,
        quickFind: true,
        pagination: 'end',
        pageSizeSwitcher: 'start',
        extraButtons: 0,
        width: '100%',
    },
} satisfies Meta<ILayoutDatasetControlProps>

export default meta

type Story = StoryObj<typeof meta>

/** Every part switched on or off through the controls, at a chosen width. */
export const Permutations: Story = {
    name: 'Permutations',
    render: (args: ILayoutDatasetControlProps) => <div style={{ padding: 18 }}><LayoutDatasetControl {...args} /></div>,
}
