import type { Meta, StoryObj } from '@storybook/react'
import { XrmMode } from '../../form/xrm-form/XrmMode'

const meta = {
    title: 'Form/Xrm/Form Context/Demos',
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const renderStory = (node: React.ReactNode) => <div style={{ minHeight: '100vh' }}>{node}</div>

export const QualificationReview: Story = {
    name: 'Qualification Review',
    parameters: {
        docs: {
            description: {
                story: 'Focused formContext workflow showing qualification review behavior with the live preview on the left and only the matching demo controls plus code on the right.',
            },
        },
    },
    render: () => renderStory(<XrmMode
        initialView="form-context"
        initialFormContextScenarioId="qualification-review"
        formContextScenarioIds={["qualification-review"]}
        hideWorkspaceViewPivot
        useStorybookViewport
        showFormContextCodePanel
        hideFormContextConsole
    />),
}

export const DigitalEngagement: Story = {
    name: 'Digital Engagement Route',
    parameters: {
        docs: {
            description: {
                story: 'Focused formContext workflow showing the digital engagement route with only the matching demo controls and code beside the preview.',
            },
        },
    },
    render: () => renderStory(<XrmMode
        initialView="form-context"
        initialFormContextScenarioId="digital-engagement"
        formContextScenarioIds={["digital-engagement"]}
        hideWorkspaceViewPivot
        useStorybookViewport
        showFormContextCodePanel
        hideFormContextConsole
    />),
}

export const FinancialApproval: Story = {
    name: 'Financial Approval Checkpoint',
    parameters: {
        docs: {
            description: {
                story: 'Focused formContext workflow showing the financial approval checkpoint with only the matching demo controls and code beside the preview.',
            },
        },
    },
    render: () => renderStory(<XrmMode
        initialView="form-context"
        initialFormContextScenarioId="financial-approval"
        formContextScenarioIds={["financial-approval"]}
        hideWorkspaceViewPivot
        useStorybookViewport
        showFormContextCodePanel
        hideFormContextConsole
    />),
}

export const SchedulingHandoff: Story = {
    name: 'Scheduling Handoff',
    parameters: {
        docs: {
            description: {
                story: 'Focused formContext workflow showing the scheduling handoff behavior with only the matching demo controls and code beside the preview.',
            },
        },
    },
    render: () => renderStory(<XrmMode
        initialView="form-context"
        initialFormContextScenarioId="scheduling-handoff"
        formContextScenarioIds={["scheduling-handoff"]}
        hideWorkspaceViewPivot
        useStorybookViewport
        showFormContextCodePanel
        hideFormContextConsole
    />),
}

export const Console: Story = {
    name: 'Console',
    parameters: {
        docs: {
            description: {
                story: 'Focused live console view for formContext event reactions, separated from the workflow stories so the right side stays lighter there.',
            },
        },
    },
    render: () => renderStory(<XrmMode
        initialView="form-context"
        hideWorkspaceViewPivot
        useStorybookViewport
        hideFormContextScenarioPanel
        hideFormContextConsole={false}
    />),
}
