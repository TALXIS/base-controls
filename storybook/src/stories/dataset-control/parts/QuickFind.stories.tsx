import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { QuickFindExample } from '../../../dataset-control/examples/partsExamples'

const DESCRIPTION = `
\`DatasetControl.QuickFind\` searches the records, in the provider's quick find columns, or its primary column when it has none.

\`\`\`tsx
<DatasetControl.Header.End>
    <DatasetControl.QuickFind />
</DatasetControl.Header.End>
\`\`\`

- Type and press Enter, or the search icon, to search. The cross clears the search.
- A leading \`*\` matches anywhere in the value, more slowly, and the callout warns about it.
- Focusing the field shows which columns it searches.
- The placeholder names the records from the provider's metadata, or *records* without any.
- The field is disabled while the provider loads, and when there is no column to search.

{{story: Find a deal}}

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| \`labels\` | \`Partial<IQuickFindLabels>\` | English | See [**Localization**](?path=/docs/datasetcontrol-localization--overview). |
| \`components\` | \`Partial<IQuickFindUiComponents>\` | Defaults | See *Replace pieces of the parts* on [**Your own UI**](?path=/docs/datasetcontrol-your-own-ui--overview). |

## From your code

\`control.parts.get('quickFind')\` returns the quick find while it is rendered. See *Parts live as long as a load* on [**Talking to the control**](?path=/docs/datasetcontrol-talking-to-the-control--overview). Put a query in it and search, as if the user typed it:

\`\`\`tsx
const quickFind = control.parts.get('quickFind')
quickFind.setQuery('Contoso')
quickFind.search()
\`\`\`

| Member | Description |
|---|---|
| \`getQuery()\` | The query in the field, searched or not. |
| \`setQuery(query)\` | Puts the query in the field, without searching. |
| \`search()\` | Searches for the query. Asks first when there are unsaved changes. |
| \`clear()\` | Empties the field and searches again. |
| \`getColumns()\` | The columns a search matches on. |
| \`isLikeQuery()\` | Whether the query starts with \`*\`. |
| \`events\` | \`onQueryChanged\`, whenever the query is edited. |
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
                story: `Try: search for *Contoso*, then for *\\*rollout*, which matches anywhere in the name, and focus the field to see which columns it searches.`,
            },
        },
    },
}
