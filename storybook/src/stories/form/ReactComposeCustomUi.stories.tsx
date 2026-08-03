import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ReactComposeMode } from '../../form/react-form/ReactComposeMode'

const renderStory = (node: React.ReactNode) => <div style={{ minHeight: '100vh' }}>{node}</div>

const meta = {
    title: 'Form/React compose/Custom UI',
    tags: ['autodocs'],
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const StepperTabs: Story = {
    name: 'Custom Tabs',
    parameters: {
        docs: {
            description: {
                story: 'Focused live demo of the React compose tabs override using the horizontal Material UI Stepper pattern.',
            },
        },
    },
    render: () => renderStory(<ReactComposeMode
        initialTabsFlavor="stepper"
        initialStepperOrientation="horizontal"
        initialView="preview"
        hideTabsFlavorPivot
        hidePreviewCodeToggle
        hideWorkspaceViewPivot
        useStorybookViewport
    />),
}

export const StepperTabsVertical: Story = {
    name: 'Custom Tabs Vertical',
    parameters: {
        docs: {
            description: {
                story: 'Focused live demo of the React compose tabs override using the vertical Material UI Stepper pattern.',
            },
        },
    },
    render: () => renderStory(<ReactComposeMode
        initialTabsFlavor="stepper"
        initialStepperOrientation="vertical"
        initialView="preview"
        initialShowPreviewCode={false}
        hideTabsFlavorPivot
        hidePreviewCodeToggle
        hideWorkspaceViewPivot
        useStorybookViewport
    />),
}
