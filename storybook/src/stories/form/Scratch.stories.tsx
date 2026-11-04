import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from './storyHelpers'
import { ScratchExample } from '../../form/react-form/devExamples'

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
    render: () => renderStory(<ScratchExample />),
}
