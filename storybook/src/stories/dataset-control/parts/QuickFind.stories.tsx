import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { QuickFindExample } from '../../../dataset-control/examples/partsExamples'

const DESCRIPTION = `
Quick find lets the user narrow the records down by typing, without building a filter: they type the start of a name and see only the records that match. It searches the columns the provider names as its quick find columns, for values that begin with what was typed. You add the field with \`DatasetControl.QuickFind\`.

{{story: Find a deal}}

## How it behaves

- **Search:** Enter or the search icon searches; clicking the field opens a callout listing the columns it searches.
- **Leading \`*\`:** the callout warns that it searches more slowly.
- **Clear:** the cross empties the field and searches again.
- **Placeholder:** names the records from the provider's metadata, or says *records*.
- **Disabled:** while the provider loads, and when there is no column to search.
- **Unsaved changes:** searching asks first; if the user cancels, the records stay as they were.
- **Compact header:** the field collapses to a search button; see *Fit a narrow screen* on [**Layout**](?path=/docs/controls-datasetcontrol-layout--overview).

## Columns it searches

The provider decides which columns are searched and what matches, and the field is disabled while it names none: see *Pick a provider* on [**Data providers**](?path=/docs/concepts-data-providers--overview).

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| \`components\` | \`Partial<IQuickFindUiComponents>\` | Defaults | See [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview). |

## From your code

\`control.parts.get('quickFind')\` returns the quick find once it is drawn (see *Reach the parts* on [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview)). Follow what the user types with \`onQueryChanged\`, as the example does below the control.

| Member | Does |
|---|---|
| \`getQuery()\` | The query in the field, searched or not. |
| \`setQuery(query)\` | Puts the query in the field, without searching. |
| \`search()\` | Searches for the query; asks first when there are unsaved changes. |
| \`clear()\` | Empties the field, then searches again; if the user cancels the unsaved-changes prompt, the field stays empty but the search does not. |
| \`getColumns()\` | The columns a search matches on. |
| \`isLikeQuery()\` | Whether the query starts with \`*\`. |
| \`events\` | \`onQueryChanged\`, whenever the query is edited. |

**Strings:** \`QUICK_FIND_LABELS\`, keys \`quickFind.*\`. See [**Localization**](?path=/docs/concepts-localization--overview).
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
                story: `The deals are searched by name and account manager, and *Typed* follows the query as it is edited. Try: search for *Contoso*, then *Anna*, then *\\*rollout*, which matches anywhere, and click the field to see the columns it searches.`,
            },
        },
    },
}
