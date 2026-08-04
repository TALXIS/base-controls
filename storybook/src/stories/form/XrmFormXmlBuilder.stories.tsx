import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { XrmMode } from '../../form/xrm-form/XrmMode'
import { renderStory } from './storyHelpers'

const meta = {
    title: 'Form/Xrm/FormXml builder',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            story: {
                inline: true,
            },
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            controls: { disable: true },
            description: {
                component: `
Use this page to author FormXml through a builder-focused surface. The UI builder lets you work with tabs, columns, sections, and fields visually while keeping the underlying FormXml editable in Monaco.

Use the FormXml toggle to switch between the UI builder and the raw FormXml editor.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Docs: Story = {
    render: () => renderStory(
        <XrmMode
            initialView="builder"
            initialBuilderEditorMode="ui"
            hideWorkspaceViewPivot
            hideDataEditorModeToggle
            hideModelEditorModeToggle
            useStorybookViewport
        />,
    ),
}
