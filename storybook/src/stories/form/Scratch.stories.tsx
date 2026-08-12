import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Form, MemoryStrategy, XrmForm } from '@talxis/base-controls/components/Form'
import { renderStory } from './storyHelpers'
import { getDemoRecord, getFormColumns, formMetadata } from '../../form/shared/formModel'

const strategy = new MemoryStrategy({
    onGetData: () => getDemoRecord(),
    onGetColumns: () => getFormColumns(),
    onGetMetadata: () => formMetadata,
})

const ScratchForm = () => {
    const [activeTab, setActiveTab] = React.useState('main')

    return (
        <>
        <Form.Root strategy={strategy}>
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
    title: 'Form/Dev/Scratch',
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
