import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { MessageBarType } from '@fluentui/react'
import { Form } from '@talxis/base-controls/components/Form'
import { getOverviewStrategy } from '../../form/overview/overviewModel'
import { renderStory } from './storyHelpers'

const OverviewForm = () => {
    const [activeTab, setActiveTab] = React.useState('overview')

    return (
        <Form.Root strategy={getOverviewStrategy()}>
            <Form.Notifications
                messages={[
                    {
                        id: 'overview-info',
                        type: MessageBarType.info,
                        text: 'This example shows the runtime with notifications, ribbon save state, tabs, sections, and multi-column layout enabled together.',
                    },
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

const meta = {
    title: 'Form/Get started',
    tags: ['autodocs'],
    parameters: {
        docs: {
            story: {
                inline: true,
            },
            description: {
                component: `
Form is a record-driven form runtime.

It gives you the pieces that usually have to be wired by hand: layout, field binding, validation, notifications, tab and section structure, dirty tracking, and save orchestration working as one system.

The same runtime can be authored directly in React or driven from an Xrm/FormXml model. Both paths share the same core runtime, but they differ in how the layout is authored and how the runtime surface is exposed.

## What you get from the runtime

- Bind fields to a shared runtime instead of managing each control in isolation.
- Keep validation, notifications, and form state coordinated across the full page.
- Support both React-first authoring and Xrm-style FormXml authoring on the same underlying runtime.
- Allow custom UI layers without throwing away the form behavior underneath.

## Choose an authoring path

Form supports two authoring models over the same runtime. Choose the one that matches where your form definition lives and how you want to work.

### React compose
Choose this path when you want to author the layout directly in JSX with \`Form.Root\`, tabs, sections, fields, and optional React-level UI overrides.

This is the best fit when:

- the form layout should live in React code
- you want component-level composition and custom rendering directly in JSX
- you do not need an Xrm-style \`formContext\` API surface

Go to [**React compose Playground**](?path=/docs/form-react-compose-playground--docs).

### Xrm
Choose this path when the form should be driven by FormXml and expose Xrm form context APIs.

\`XrmForm\` builds on top of the base Form runtime, keeps the layout FormXml-driven, and exposes a Microsoft form-context-compatible \`formContext\` surface while persistence still comes from the base Form strategy contract.

This is the best fit when:

- the layout is defined in FormXml
- the record payload already follows Dataverse conventions
- you want to script against \`formContext\` in a model-driven-app style
- you want to combine Base Controls React events with Xrm-style runtime access

Go to [**Xrm Playground**](?path=/docs/form-xrm-playground--docs) or [**Xrm Form context**](?path=/docs/form-xrm-form-context--docs).
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Docs: Story = {
    render: () => renderStory(<OverviewForm />, 24),
}
