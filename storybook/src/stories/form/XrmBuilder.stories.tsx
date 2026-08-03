import type { Meta, StoryObj } from '@storybook/react'
import { XrmMode } from '../../form/xrm-form/XrmMode'
import React from 'react'

const renderStory = (node: React.ReactNode) => <div style={{ minHeight: '100vh' }}>{node}</div>

const meta = {
    title: 'Form/Xrm/Builder',
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Preview: Story = {
    parameters: {
        docs: {
            description: {
                story: 'Preview the current FormXml layout with the same data and model that the builder edits, and use the in-story FormXml toggle to inspect or edit the current XML in Monaco.',
            },
        },
    },
    render: () => renderStory(<XrmMode
        initialView="preview"
        hideWorkspaceViewPivot
        useStorybookViewport
    />),
}

export const Builder: Story = {
    name: 'Form Xml',
    parameters: {
        docs: {
            description: {
                story: 'Build the form visually by default, then use the in-story toggle to switch to the Monaco FormXml editor when needed.',
            },
        },
    },
    render: () => renderStory(<XrmMode
        initialView="builder"
        hideWorkspaceViewPivot
        useStorybookViewport
        initialBuilderEditorMode="ui"
    />),
}

export const DataEditor: Story = {
    name: 'Data',
    parameters: {
        docs: {
            description: {
                story: 'Inspect and edit the same builder record data as raw JSON.',
            },
        },
    },
    render: () => renderStory(<XrmMode
        initialView="data"
        hideWorkspaceViewPivot
        useStorybookViewport
        initialDataEditorMode="json"
        hideDataEditorModeToggle
    />),
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
    render: () => renderStory(<XrmMode
        initialView="model"
        hideWorkspaceViewPivot
        useStorybookViewport
        initialModelEditorMode="ui"
    />),
}
