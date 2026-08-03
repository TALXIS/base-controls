import type { Meta, StoryObj } from '@storybook/react'

const meta = {
    title: 'Form/Concepts/Introduction',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
Form is a complete runtime for building record-driven experiences, not just a set of input controls.

It brings together data loading, field binding, validation, dirty tracking, save orchestration, and layout primitives so a form behaves like a single system instead of a loose collection of components.

The package supports two main authoring models:
- a compose-first React API built around the exported Form object
- XrmForm, which renders from FormXml and exposes a Microsoft-style formContext

Use the React compose and Xrm sections in Storybook to explore those two models through live demos and docs tabs.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
    render: () => null,
}
