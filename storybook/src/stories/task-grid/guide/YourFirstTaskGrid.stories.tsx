import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { GuideNavigation } from '../../../task-grid/guide/GuideSteps'
import { SmallestTaskGridExample } from '../../../task-grid/guide/yourFirstTaskGridExamples'

const DESCRIPTION = `
A task grid needs three things: your rows, a *store* that keeps them, and a *field mapping* that names the columns making the tree. \`TaskDatasetControl\` gets both from \`onLoad\`, and \`TaskGrid\` in its body draws the tasks. Open **Code**: its comments walk through each line, and *office.ts* holds the rows.

Like every control, it needs the root providers from [**Quick start**](?path=/docs/concepts-quick-start--overview). Each step after this one adds one feature.

Try: add \`enableCreation\` to \`TaskDatasetControl\` in **Code**, then press **+** on a row.

{{story: Your first task grid}}

{{block: navigation}}
`

const meta = {
    title: 'Controls/TaskGrid/Guide/Your first task grid',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { navigation: () => <GuideNavigation current='Your first task grid' /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const YourFirstTaskGrid: Story = {
    name: 'Your first task grid',
    tags: ['!dev'],
    render: () => renderStory(<SmallestTaskGridExample />),
}
