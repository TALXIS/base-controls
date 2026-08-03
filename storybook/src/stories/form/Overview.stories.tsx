import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Form } from '@talxis/base-controls/components/Form'
import { getOverviewStrategy } from '../../form/overview/overviewModel'
import { renderStory } from './storyHelpers'

const OverviewForm = () => {
    const [activeTab, setActiveTab] = React.useState('overview')

    return (
        <Form.Root strategy={getOverviewStrategy()}>
            <Form.Notifications />
            <Form.Tabs expandedTab={activeTab} onTabChange={setActiveTab}>
                <Form.Tab id="overview" label="Overview">
                    <Form.Column>
                        <Form.Section label="Project" layout={{ lg: 2 }}>
                            <Form.Field name="company"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="contact"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="phone"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="workspace"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                        </Form.Section>
                    </Form.Column>
                    <Form.Column>
                        <Form.Section label="Delivery status" layout={{ lg: 1 }}>
                            <Form.Field name="engagementStage"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="needsApproval"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="estimatedValue"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                            <Form.Field name="targetDate"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
                        </Form.Section>
                    </Form.Column>
                </Form.Tab>
                <Form.Tab id="narrative" label="Narrative">
                    <Form.Column>
                        <Form.Section label="Why this runtime helps" layout={{ lg: 1 }}>
                            <Form.Field name="summary"><Form.Cell><Form.Control /></Form.Cell></Form.Field>
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

The same runtime can be authored directly in React or driven from an Xrm/FormXml model.

## What it can do

- Bind fields to a shared runtime instead of managing each control in isolation.
- Keep validation, notifications, and form state coordinated across the full page.
- Support both React-first authoring and Xrm-style FormXml authoring on the same underlying runtime.
- Allow custom UI layers without throwing away the form behavior underneath.

## Choose an authoring path

Form supports two authoring models over the same runtime. Choose the one that matches where your form definition lives and how you want to work.

### React compose
Choose this path when you want to author the layout directly in JSX with \`Form.Root\`, tabs, sections, fields, and optional React-level UI overrides.

Go to [**React compose Playground**](?path=/docs/form-react-compose-playground--docs).

### Xrm
Choose this path when the form should be driven by FormXml and expose Xrm form context APIs.

Go to [**Xrm Playground**](?path=/docs/form-xrm-playground--docs).

## Advanced topics

The **Advanced** sections keep customization and runtime-behavior demos separate from the main playgrounds so the primary flow stays easier to scan.
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
