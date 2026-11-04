import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from './storyHelpers'
import { HiddenTabValidationExample } from '../../form/react-form/devExamples'

const meta = {
    title: 'Dev/Form/Validation scenarios',
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

export const HiddenTabValidationRegistration: Story = {
    name: 'Hidden-tab validation registration',
    render: () => renderStory(<HiddenTabValidationExample />),
}
