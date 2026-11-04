import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Form, XrmForm } from '@talxis/base-controls'
import { renderStory } from './storyHelpers'
import { getMemoryRecord } from '../../form/shared/formModel'

const ScratchForm = () => {
    const [activeTab, setActiveTab] = React.useState('main')

    return (
        <>
        <Form.Root onLoad={async () => ({ record: getMemoryRecord() })} autoSave>
            <Form.Notifications />
            <Form.Ribbon />
            <Form.Tabs expandedTab={activeTab} onTabChange={setActiveTab}>
                <Form.Tab id="main" label="Main">
                    <Form.Column>
                        <Form.Section label="Scratch area" layout={{ lg: 1 }}>
                        </Form.Section>
                    </Form.Column>
                </Form.Tab>
            </Form.Tabs>
        </Form.Root>
        </>
    )
}

const meta = {
    title: 'Dev/Form/Scratch',
    tags: ['dev-only'],
    parameters: {
        controls: { disable: true },
        docs: {
            disable: true,
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
    name: 'Playground',
    render: () => renderStory(<ScratchForm />),
}
