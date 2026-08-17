import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FormContextSamplePreview, formContextSampleDefinitions } from './formContextExamples'
import { renderStory } from './storyHelpers'

const samplesById = Object.fromEntries(formContextSampleDefinitions.map((sample) => [sample.id, sample])) as Record<string, typeof formContextSampleDefinitions[number]>

const meta = {
    title: 'Form/Xrm/Form Context/Samples',
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
Ready-made business flows built on the Xrm \`formContext\` runtime, each runnable and editable in place.

## What's here

- **Qualification review** — focuses the Overview tab, requires Text and Phone, validates the phone prefix.
- **Digital engagement route** — hides Phone, promotes the URL field, requires \`https://\`.
- **Financial approval checkpoint** — focuses the Metrics tab, requires Budget, locks review-only fields.
- **Scheduling handoff** — focuses the Scheduling tab, hides secondary details, requires final scheduling fields.

Each sample keeps its own isolated form instance, so **Run code** and **Clear** act on that example only. Start from a blank snippet instead on [**Overview**](?path=/story/form-xrm-form-context-overview--overview).
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
                story: `
Mimics a lead qualification step where identity and contact data become required and phone formatting is validated before handoff.

- focuses the Overview tab
- marks Text and Phone as required
- raises a qualification notification
- validates the phone prefix
                `.trim(),
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
                story: `
Shows a digital-only path where phone is hidden, web contact becomes primary, and the URL must be secure.

- keeps the user on Overview
- renames the contact section
- requires the URL field
- validates \`https://\` usage
                `.trim(),
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
                story: `
Simulates a review stage where metrics become partially read-only and duration is validated against an approval threshold.

- focuses the Metrics tab
- requires the budget field
- locks review-only metric inputs
- validates duration limits
                `.trim(),
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
                story: `
Demonstrates a late-stage handoff where scheduling fields are promoted and secondary handoff content is hidden.

- focuses the Scheduling tab
- renames the dates section
- hides secondary handoff details
- requires final scheduling fields
                `.trim(),
            },
        },
    },
    render: () => renderStory(<FormContextSamplePreview sample={samplesById['scheduling-handoff']} />),
}
