import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Form } from '@talxis/base-controls/components/Form'
import { getOverviewStrategy } from '../../form/overview/overviewModel'

const renderStory = (node: React.ReactNode) => <div style={{ minHeight: '100vh', padding: 24 }}>{node}</div>

const OverviewForm = () => {
    const [activeTab, setActiveTab] = React.useState('overview')

    return (
        <Form.Root strategy={getOverviewStrategy()}>
            <Form.Notifications />
            <Form.Tabs expandedTab={activeTab} onTabChange={setActiveTab}>
                <Form.Tab id="overview" label="Overview">
                    <Form.Column>
                        <Form.Section label="Project" layout={{ lg: 2 }}>
                            <Form.Field name="company">
                                <Form.Cell>
                                    <Form.Control />
                                </Form.Cell>
                            </Form.Field>
                            <Form.Field name="contact">
                                <Form.Cell>
                                    <Form.Control />
                                </Form.Cell>
                            </Form.Field>
                            <Form.Field name="phone">
                                <Form.Cell>
                                    <Form.Control />
                                </Form.Cell>
                            </Form.Field>
                            <Form.Field name="workspace">
                                <Form.Cell>
                                    <Form.Control />
                                </Form.Cell>
                            </Form.Field>
                        </Form.Section>
                    </Form.Column>
                    <Form.Column>
                        <Form.Section label="Delivery status" layout={{ lg: 1 }}>
                            <Form.Field name="engagementStage">
                                <Form.Cell>
                                    <Form.Control />
                                </Form.Cell>
                            </Form.Field>
                            <Form.Field name="needsApproval">
                                <Form.Cell>
                                    <Form.Control />
                                </Form.Cell>
                            </Form.Field>
                            <Form.Field name="estimatedValue">
                                <Form.Cell>
                                    <Form.Control />
                                </Form.Cell>
                            </Form.Field>
                            <Form.Field name="targetDate">
                                <Form.Cell>
                                    <Form.Control />
                                </Form.Cell>
                            </Form.Field>
                        </Form.Section>
                    </Form.Column>
                </Form.Tab>
                <Form.Tab id="narrative" label="Narrative">
                    <Form.Column>
                        <Form.Section label="Why this runtime helps" layout={{ lg: 1 }}>
                            <Form.Field name="summary">
                                <Form.Cell>
                                    <Form.Control />
                                </Form.Cell>
                            </Form.Field>
                        </Form.Section>
                    </Form.Column>
                </Form.Tab>
            </Form.Tabs>
        </Form.Root>
    )
}

const meta = {
    title: 'Form/Overview',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
Start here when you want to understand what the Form package is for.

Form is a runtime for building record-driven experiences: layout, field binding, validation, notifications, dirty tracking, and save orchestration all work as one system. The goal is to make forms feel cohesive whether you author them in React or bring an Xrm-style model forward.

## Choose an authoring mode

### React compose
Use the React compose stories when you want to define the form directly in JSX with \`Form.Root\`, tabs, sections, fields, and custom UI overrides. This is the best fit for teams that want explicit composition, React-first ergonomics, and local control over the rendered experience.

**Go next:** **Form / React compose / Builder** to inspect preview, data, and model authoring, then **Form / React compose / Custom UI** for presentation overrides.

### Xrm / FormXml
Use the Xrm stories when the form should be driven by FormXml and feel familiar to Microsoft-style form authors. The same runtime still handles state, binding, and lifecycle, while exposing an Xrm-compatible mental model including formContext-oriented behaviors.

**Go next:** **Form / Xrm / Builder** for FormXml-backed authoring, **Form / Xrm / Form Context / Demos** for runtime workflows, and **Form / Xrm / Custom UI** for focused overrides.

## What this page gives you
- a small isolated form that is safe to click through first
- a quick sense of the layout primitives and field runtime
- a clear path into the deeper React compose and Xrm sections
                `.trim(),
            },
            story: {
                inline: true,
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
    parameters: {
        docs: {
            description: {
                story: `
A compact, isolated example of the Form runtime in action.

Try editing values, switching tabs, and watching how the form behaves as a single runtime instead of disconnected inputs. Once the shape makes sense, continue into the Builder and Custom UI sections for the authoring model that matches your project.
                `.trim(),
            },
        },
    },
    render: () => renderStory(<OverviewForm />),
}
