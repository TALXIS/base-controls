import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FormContextSamplePreview, formContextSampleDefinitions } from './formContextExamples'
import { renderStory } from './storyHelpers'

const samplesById = Object.fromEntries(formContextSampleDefinitions.map((sample) => [sample.id, sample])) as Record<string, typeof formContextSampleDefinitions[number]>

const meta = {
    title: 'Form/Xrm/Form Context/Samples',
    tags: ['autodocs'],
    name: 'Overview',
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
These samples show common business flows implemented against the Xrm \`formContext\` runtime.

Each sample below keeps its own isolated form instance, so **Run code** and **Clear** work against that example only while preserving the same live preview and Monaco workflow as the overview page.

- qualification review
- digital routing
- financial approval
- scheduling handoff

If you want to start from a blank editable snippet instead, go to [**Overview**](?path=/story/form-xrm-form-context-overview--overview).
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
    render: () => renderStory(<FormContextSamplePreview sample={samplesById['qualification-review']} />, 18),
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
    render: () => renderStory(<FormContextSamplePreview sample={samplesById['digital-engagement']} />, 18),
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
    render: () => renderStory(<FormContextSamplePreview sample={samplesById['financial-approval']} />, 18),
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
    render: () => renderStory(<FormContextSamplePreview sample={samplesById['scheduling-handoff']} />, 18),
}
