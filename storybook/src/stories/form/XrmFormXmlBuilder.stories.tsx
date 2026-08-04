import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { XrmFormXmlBuilderStory } from './XrmFormXmlBuilderStory'
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

Use the pivot to switch between Preview, Builder, and FormXml. All three views share the same dedicated builder state, so changes stay isolated from the other Xrm stories.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
    name: 'Overview',
    render: () => renderStory(
        <XrmFormXmlBuilderStory />,
    ),
}
