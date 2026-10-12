import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { QuickFindExample } from '../../../dataset-control/examples/partsExamples'

const DESCRIPTION = `\`DatasetControl.QuickFind\` searches the provider's quick find columns: the provider's own, or its primary column when it has none.

\`\`\`tsx
<DatasetControl.Header.End>
    <DatasetControl.QuickFind />
</DatasetControl.Header.End>
\`\`\`

- Type and press Enter, or the search icon, to search. The cross clears the search.
- A leading \`*\` matches anywhere in the value, more slowly, and the callout warns about it.
- Focusing the field shows which columns it searches.
- The field is disabled while the provider loads, and while it has no quick find columns and no primary column.
- The placeholder names the provider's records from its metadata, or *records* without one.

| Prop | What it does |
|---|---|
| \`labels\` | The placeholder and the callout's text. See [**Localization**](?path=/docs/datasetcontrol-localization-overview--overview). |
| \`components\` | The text field, the callout and the callout's pieces. See [**Appearance**](?path=/docs/datasetcontrol-customization-appearance--overview). |

{{story: Find a deal}}
`

const meta = {
    title: 'DatasetControl/Parts/Quick find',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const FindADeal: Story = {
    name: 'Find a deal',
    render: () => renderStory(<QuickFindExample />),
    parameters: {
        docs: {
            description: {
                story: `Search for *Contoso*, then for *\\*rollout*, which matches anywhere in the name. Focus the field to see which columns it searches.`,
            },
        },
    },
}
