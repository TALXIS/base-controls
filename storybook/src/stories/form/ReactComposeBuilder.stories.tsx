import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ReactComposeMode } from '../../form/react-form/ReactComposeMode'

const renderStory = (node: React.ReactNode) => <div style={{ minHeight: '100vh' }}>{node}</div>

const meta = {
    title: 'Form/React compose/Builder',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
The React compose model is the default way to work with the Form runtime.

You start with Form.Root, provide a strategy that knows how to load and save the record, and then describe the layout with tabs, sections, fields, cells, and controls. The form behavior stays in the runtime while the layout stays in React, which keeps the API readable and refactor-friendly.

Use this Builder section to preview the form and inspect or edit its supporting inputs like data and model definition.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Preview: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Preview the current React-composed form with the same model and data used by the builder stories.',
            },
        },
    },
    render: () => renderStory(<ReactComposeMode initialView="preview" hideTabsFlavorPivot hideWorkspaceViewPivot useStorybookViewport initialShowPreviewCode />),
}

export const DataEditor: Story = {
    name: 'Data',
    parameters: {
        docs: {
            description: {
                story: 'Inspect and edit the same React compose record data as raw JSON.',
            },
        },
    },
    render: () => renderStory(<ReactComposeMode initialView="data" hideTabsFlavorPivot hideWorkspaceViewPivot useStorybookViewport />),
}

export const Model: Story = {
    name: 'Model',
    parameters: {
        docs: {
            description: {
                story: 'Edit the field model through the guided UI by default, then use the in-story toggle to switch to the Monaco JSON editor when needed.',
            },
        },
    },
    render: () => renderStory(<ReactComposeMode initialView="model" hideTabsFlavorPivot hideWorkspaceViewPivot useStorybookViewport />),
}
