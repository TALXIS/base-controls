import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { ReactComposeOverviewPreview } from './ReactComposeOverviewPreview'
import { ExampleRunner, renderStory } from './storyHelpers'
import { FormCodeEditor } from '../../form/react-form/FormCodeEditor'
import { defaultFormCode } from '../../form/react-form/defaultFormCode'

const ReactComposeOverviewStory = () => {
    const [code, setCode] = React.useState(defaultFormCode)
    const [compileError, setCompileError] = React.useState<string | null>(null)

    return (
        <ExampleRunner
            code={code}
            seedCode={defaultFormCode}
            onCodeChange={setCode}
            error={compileError}
            renderPreview={() => <ReactComposeOverviewPreview code={code} onError={setCompileError} />}
            renderCode={() => <FormCodeEditor value={code} onChange={setCode} />}
        />
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

The form below edits an in-memory project record, loaded as on [**Loading a record**](?path=/docs/controls-form-get-started-loading-a-record--overview). Try: open **Code** and edit the \`Form.Root\` composition.
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
