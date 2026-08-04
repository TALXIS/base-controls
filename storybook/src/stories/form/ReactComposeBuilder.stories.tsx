import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ReactComposeMode } from '../../form/react-form/ReactComposeMode'
import { renderStory } from './storyHelpers'

const meta = {
    title: 'Form/React compose',
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
Use React compose when you want to build the form purely in React.

In this authoring path, the form structure is defined directly in JSX with \`Form.Root\`, tabs, sections, fields, and optional React-level UI overrides. The runtime still handles binding, validation, notifications, dirty tracking, and save orchestration while keeping the authoring surface fully React-first.

This page focuses on one React-authored form. Use the Code toggle to open the code editor and inspect or edit the form definition directly.
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
        <div>
            <ReactComposeMode
                initialView="preview"
                initialTabsFlavor="pivot"
                hideTabsFlavorPivot
                hideWorkspaceViewPivot
                useStorybookViewport
            />
        </div>,
    ),
}
