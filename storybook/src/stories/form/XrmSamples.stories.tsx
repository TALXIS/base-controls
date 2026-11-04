import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FormContextSamplePreview, formContextSampleDefinitions } from './formContextExamples'
import { renderStory } from './storyHelpers'

const samplesById = Object.fromEntries(formContextSampleDefinitions.map((sample) => [sample.id, sample])) as Record<string, typeof formContextSampleDefinitions[number]>

const meta = {
    title: 'Controls/Form/Xrm/Form Context/Samples',
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
Ready-made business flows built on the Xrm \`formContext\`, each runnable and editable in place. Each sample has a form of its own, so **Run code** and **Clear** act on that sample only; to start from a blank snippet, see [**Form Context**](?path=/docs/controls-form-xrm-form-context-overview--overview).
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const QualificationReview: Story = {
    name: 'Qualification review',
    parameters: {
        docs: {
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                story: `A lead qualification step that focuses *Overview*, requires Text and Phone, and validates the phone prefix. Try: press **Run code**, then enter a phone number without the prefix.`,
            },
        },
    },
    render: () => renderStory(<FormContextSamplePreview sample={samplesById['qualification-review']} />),
}

export const DigitalEngagement: Story = {
    name: 'Digital engagement route',
    parameters: {
        docs: {
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                story: `A digital-only path that hides Phone, renames the contact section and requires a secure URL. Try: press **Run code**, then enter an \`http://\` URL.`,
            },
        },
    },
    render: () => renderStory(<FormContextSamplePreview sample={samplesById['digital-engagement']} />),
}

export const FinancialApproval: Story = {
    name: 'Financial approval checkpoint',
    parameters: {
        docs: {
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                story: `A review stage that focuses *Metrics*, requires the budget, locks review-only inputs and validates the duration. Try: press **Run code**.`,
            },
        },
    },
    render: () => renderStory(<FormContextSamplePreview sample={samplesById['financial-approval']} />),
}

export const SchedulingHandoff: Story = {
    name: 'Scheduling handoff',
    parameters: {
        docs: {
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                story: `A late-stage handoff that focuses *Scheduling*, renames the dates section, hides secondary details and requires the final scheduling fields.`,
            },
        },
    },
    render: () => renderStory(<FormContextSamplePreview sample={samplesById['scheduling-handoff']} />),
}
