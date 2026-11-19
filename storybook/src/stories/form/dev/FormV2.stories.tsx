import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FormV2Playground } from '../../../form/form-v2/FormV2Playground'
import { CardPlayground } from '../../../form/form-v2/CardPlayground'

const meta = {
    title: 'Dev/FormV2',
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

/** Tabs, sections and controls found and changed through the runtime, before their tab is opened. */
export const Playground: Story = {
    name: 'Playground',
    render: () => <div style={{ padding: 18 }}><FormV2Playground /></div>,
}

/** The Card the form's sections will be composed from. */
export const Card: Story = {
    name: 'Card',
    render: () => <div style={{ padding: 18 }}><CardPlayground /></div>,
}
