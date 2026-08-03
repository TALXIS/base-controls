import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ReactComposeMode } from '../../form/react-form/ReactComposeMode'
import { renderStory } from './storyHelpers'

type TComposeWorkspaceView = 'preview' | 'data' | 'model'

interface IReactComposeStoryArgs {
    view: TComposeWorkspaceView
    showCode: boolean
}

const meta = {
    title: 'Form/React compose',
    tags: ['autodocs'],
    args: {
        view: 'preview',
        showCode: true,
    },
    argTypes: {
        view: {
            control: 'inline-radio',
            options: ['preview'],
        },
        showCode: {
            control: 'boolean',
            if: { arg: 'view', eq: 'preview' },
        },
    },
    parameters: {
        docs: {
            description: {
                component: `
Use React compose when you want to build the form purely in React.

In this authoring path, the form structure is defined directly in JSX with \`Form.Root\`, tabs, sections, fields, and optional React-level UI overrides. The runtime still handles binding, validation, notifications, dirty tracking, and save orchestration, but the layout itself is authored in React instead of FormXml.

This page focuses on one React-authored form. Use the Code toggle to open Monaco and inspect or edit the form definition directly.
                `.trim(),
            },
        },
    },
    render: (args: IReactComposeStoryArgs) => renderStory(
        <ReactComposeMode
            initialView={args.view}
            initialTabsFlavor="pivot"
            initialShowPreviewCode={args.showCode}
            hideTabsFlavorPivot
            hideWorkspaceViewPivot
            useStorybookViewport
        />,
    ),
} satisfies Meta<IReactComposeStoryArgs>

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
    parameters: {
        docs: {
            story: {
                inline: true,
            },
        },
    },
}
