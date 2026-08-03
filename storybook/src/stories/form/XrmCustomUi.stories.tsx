import type { Meta, StoryObj } from '@storybook/react'
import { XrmMode } from '../../form/xrm-form/XrmMode'
import React from 'react'

const renderStory = (node: React.ReactNode) => <div style={{ minHeight: '100vh' }}>{node}</div>

const meta = {
    title: 'Form/Xrm/Custom UI',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
Override parts of the Xrm presentation layer while keeping the same underlying form runtime.

Use this section for focused demos of top-level custom controls and custom tab rendering while preserving the same data binding, field state, and Xrm-oriented lifecycle underneath.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const CustomControls: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Focused live demo of top-level control overrides for selected Xrm control ids.',
            },
        },
    },
    render: () => renderStory(<XrmMode
        initialView="custom-components"
        initialCustomComponentsFlavor="controls"
        hideWorkspaceViewPivot
        hideCustomComponentsPivot
        useStorybookViewport
        initialShowCustomComponentsCode
        initialShowCustomComponentsData
        initialShowCustomComponentsXml
    />),
}

export const CustomTabs: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Focused live demo of the Xrm tabs override using the Material UI Stepper pattern.',
            },
        },
    },
    render: () => renderStory(<XrmMode
        initialView="custom-components"
        initialCustomComponentsFlavor="tabs"
        hideWorkspaceViewPivot
        hideCustomComponentsPivot
        useStorybookViewport
        initialShowCustomComponentsCode
        initialShowCustomComponentsData
        initialShowCustomComponentsXml
        initialCustomTabsOrientation="horizontal"
        hideCustomTabsOrientationSelector
    />),
}

export const CustomTabsVertical: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Focused live demo of the Xrm tabs override using the vertical Material UI Stepper pattern.',
            },
        },
    },
    render: () => renderStory(<XrmMode
        initialView="custom-components"
        initialCustomComponentsFlavor="tabs"
        hideWorkspaceViewPivot
        hideCustomComponentsPivot
        useStorybookViewport
        initialShowCustomComponentsCode
        initialShowCustomComponentsData
        initialShowCustomComponentsXml
        initialCustomTabsOrientation="vertical"
        hideCustomTabsOrientationSelector
    />),
}
