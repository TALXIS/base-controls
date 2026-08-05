import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Toggle } from '@fluentui/react'
import { getDemoRecord, getFormColumns } from '../../form/shared/formModel'
import { ReactComposeOverviewPreview } from './ReactComposeOverviewPreview'
import { StaticCodeBlock, codeBlockStyles, renderStory } from './storyHelpers'

const ReactComposeOverviewStory = () => {
    const [showCode, setShowCode] = React.useState(false)

    return (
        <div className={codeBlockStyles.root}>
            <StaticCodeBlock title="Model" value={JSON.stringify(getFormColumns(), null, 2)} />
            <StaticCodeBlock title="Data" value={JSON.stringify(getDemoRecord(), null, 2)} />
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
            description: {
                component: `
Author the form directly in JSX with \`Form.Root\`, tabs, sections, and fields.

The runtime handles binding, validation, notifications, dirty tracking, and save orchestration; you control layout and composition in React. Use this path when the form definition should live in code rather than in FormXml.

## What this page shows

Expand **Model** and **Data** to inspect the inputs behind the rendered form below, then switch on **Code** to see the \`Form.Root\` composition that produced it.
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
