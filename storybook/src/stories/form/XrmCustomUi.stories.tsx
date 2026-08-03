import type { Meta, StoryObj } from '@storybook/react'
import { XrmMode } from '../../form/xrm-form/XrmMode'

const renderStory = (node: React.ReactNode) => <div style={{ minHeight: '100vh' }}>{node}</div>

const meta = {
    title: 'Form/Xrm/Custom UI',
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
