import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { QuickFindExample } from '../../../dataset-control/examples/partsExamples'

const DESCRIPTION = `
\`DatasetControl.QuickFind\` searches the records in the provider's quick find columns, or its primary column when it has none.

\`\`\`tsx
<DatasetControl.Header.End>
    <DatasetControl.QuickFind />
</DatasetControl.Header.End>
\`\`\`

{{story: Find a deal}}

Type and press Enter, or the search icon, to search; the cross clears the search. Clicking the field opens a callout listing the columns it searches. A leading \`*\` matches anywhere in the value, more slowly, and the callout warns about it. The placeholder names the records from the provider's metadata, or says *records*. The field is disabled while the provider loads, and when there is no column to search. Searching asks first when the records have unsaved changes.

In a compact header the field collapses to a search button, with a dot while it holds a query; clicking it opens the field across the whole header. See *Fit a narrow screen* on [**Layout**](?path=/docs/controls-datasetcontrol-layout--overview).

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| \`components\` | \`Partial<IQuickFindUiComponents>\` | Defaults | See [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview). |

## From your code

\`control.parts.get('quickFind')\` returns the quick find once it is drawn (see *Reach the parts* on [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview)). Put a query in it and search, as if the user typed it:

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
    title: 'Controls/DatasetControl/Parts/Quick find',
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
                story: `Try: search for *Contoso*, then for *\\*rollout*, which matches anywhere in the name, and click the field to see which columns it searches.`,
            },
        },
    },
}
