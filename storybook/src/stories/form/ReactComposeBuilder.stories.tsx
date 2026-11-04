import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Toggle } from '@fluentui/react'
import { ReactComposeOverviewPreview } from './ReactComposeOverviewPreview'
import { codeBlockStyles, renderStory } from './storyHelpers'

const ReactComposeOverviewStory = () => {
    const [showCode, setShowCode] = React.useState(false)

    return (
        <div className={codeBlockStyles.root}>
            <div className={codeBlockStyles.previewHeader}>
                <Toggle
                    label="Code"
                    inlineLabel
                    checked={showCode}
                    onChange={(_event, checked) => setShowCode(!!checked)}
                />
            </div>
            <div style={{ minHeight: 0, flex: 1 }}>
                <ReactComposeOverviewPreview showCode={showCode} />
            </div>
        </div>
    )
}

const meta = {
    title: 'Controls/Form/React compose',
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
            description: {
                component: `
Author the form directly in JSX with \`Form.Root\`, tabs, sections, and fields. The form handles binding, validation, notifications, unsaved changes and saving; you decide the layout and composition in React. Use this path when the form definition should live in code rather than in FormXml.

The form below edits an in-memory project record, shaped as on [**Form strategy**](?path=/docs/controls-form-get-started-form-strategy--overview). Try: switch on **Code** and edit the \`Form.Root\` composition.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
    name: 'Overview',
    render: () => renderStory(<ReactComposeOverviewStory />),
}
