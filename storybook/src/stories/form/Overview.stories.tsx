import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { MessageBarType } from '@fluentui/react'
import { Form } from '@talxis/base-controls'
import { getOverviewStrategy } from '../../form/overview/overviewModel'
import { renderStory } from './storyHelpers'
import { docsPageWithExample } from '../docsPageWithExample'

const OverviewForm = () => {
    const [activeTab, setActiveTab] = React.useState('overview')

    return (
        <Form.Root strategy={getOverviewStrategy()}>
            <Form.Notifications
                messages={[
                    {
                        id: 'overview-warning',
                        type: MessageBarType.warning,
                        text: 'Approval is still required because the approved budget is lower than the estimated value.',
                    },
                ]}
            />
            <Form.Ribbon />
            <Form.Tabs expandedTab={activeTab} onTabChange={setActiveTab}>
                <Form.Tab id="overview" label="Overview">
                    <Form.Column>
                        <Form.Section label="Project" layout={{ lg: 2 }}>
                            <Form.Field name="company"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="contact"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="owner"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="phone"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="workspace"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="trackerUrl"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                        </Form.Section>
                        <Form.Section label="Scope" layout={{ lg: 1 }}>
                            <Form.Field name="summary"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="scope"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                        </Form.Section>
                    </Form.Column>
                    <Form.Column>
                        <Form.Section label="Delivery status" layout={{ lg: 2 }}>
                            <Form.Field name="engagementStage"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="priority"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="needsApproval"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="estimatedValue"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="approvedBudget"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="targetDate"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="kickoffDate"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                        </Form.Section>
                    </Form.Column>
                </Form.Tab>
                <Form.Tab id="delivery" label="Delivery">
                    <Form.Column>
                        <Form.Section label="Assignment" layout={{ lg: 1 }}>
                            <Form.Field name="accountManager"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="deliveryRegion"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                        </Form.Section>
                    </Form.Column>
                    <Form.Column>
                        <Form.Section label="Timeline" layout={{ lg: 1 }}>
                            <Form.Field name="kickoffDate"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="targetDate"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                        </Form.Section>
                    </Form.Column>
                </Form.Tab>
                <Form.Tab id="governance" label="Governance">
                    <Form.Column>
                        <Form.Section label="Approvals" layout={{ lg: 1 }}>
                            <Form.Field name="needsApproval"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="priority"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                        </Form.Section>
                    </Form.Column>
                    <Form.Column>
                        <Form.Section label="Financials" layout={{ lg: 1 }}>
                            <Form.Field name="estimatedValue"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="approvedBudget"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                        </Form.Section>
                    </Form.Column>
                </Form.Tab>
            </Form.Tabs>
        </Form.Root>
    )
}

const DESCRIPTION = `
A form shows one record laid out in tabs, sections and columns, and keeps every field in step with it. Values typed into fields land on the record, validation and notifications show where they apply, and the ribbon knows when there are unsaved changes and saves them. You describe the layout and supply the record through a [**Form strategy**](?path=/docs/controls-form-get-started-form-strategy--overview); the form wires the rest. Try: change a value and watch the ribbon report unsaved changes.

## Lay it out in React

Write the tabs, sections and fields in JSX under \`Form.Root\`, and swap any piece for your own component: see [**React compose**](?path=/docs/controls-form-react-compose--overview).

## Lay it out in FormXml

\`XrmForm\` draws a FormXml layout over the same form and lets your scripts talk to it through an Xrm-style \`formContext\`, as a model-driven app does: see [**Xrm**](?path=/docs/controls-form-xrm-overview--overview).
`

const meta = {
    title: 'Controls/Form/Get started',
    tags: ['autodocs'],
    parameters: {
        docs: {
            page: docsPageWithExample(DESCRIPTION),
            story: {
                inline: true,
            },
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
    name: 'Overview',
    render: () => renderStory(<OverviewForm />),
}
