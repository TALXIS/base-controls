import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { QuickFindExample } from '../../../dataset-control/examples/partsExamples'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'

const DESCRIPTION = `
Quick find is a search field: the user types and sees only the records that match, without building a filter. You add it with \`DatasetControl.QuickFind\`. Try it below: search for *Contoso*.

{{canvas: Find a deal}}

## How it behaves

- **Search:** Enter or the search icon searches; clicking the field opens a callout listing the columns it searches.
- **Leading \`*\`:** the callout warns that it searches more slowly.
- **Clear:** the cross empties the field and searches again.
- **Placeholder:** names the records from the provider's metadata, or says *records*.
- **Disabled:** while the provider loads, and when there is no column to search.
- **Unsaved changes:** searching asks about them first: see [**Loading data**](?path=/docs/controls-datasetcontrol-loading-data--overview).
- **Compact header:** the field collapses to a search button: see [**Layout**](?path=/docs/controls-datasetcontrol-layout--overview).

## Columns it searches

The provider decides which columns are searched and what matches, and the field is disabled while it names none: see [**Data providers**](?path=/docs/concepts-data-providers--overview).

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| \`components\` | \`Partial<IDatasetControlUiQuickFindComponents>\` | Defaults | See [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview). |

## From your code

\`control.parts.get('quickFind')\` returns the quick find once it is drawn: see [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview). Follow what the user types with \`onQueryChanged\`, as the example does below the control.

| Member | Does |
|---|---|
| \`getQuery()\` | The query in the field, searched or not. |
| \`setQuery(query)\` | Puts the query in the field, without searching. |
| \`search()\` | Searches for the query, asking about unsaved changes first. |
| \`clear()\` | Empties the field, then searches again; if the user keeps unsaved changes, the field stays empty but the records do not change. |
| \`getColumns()\` | The columns a search matches on. |
| \`isLikeQuery()\` | Whether the query starts with \`*\`. |
| \`events\` | \`onQueryChanged\`, whenever the query is edited. |

**Strings:** \`QUICK_FIND_LABELS\`, keys \`quickFind.*\`. See [**Localization**](?path=/docs/concepts-localization--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Edit columns', iconName: 'ColumnOptions', href: '?path=/docs/controls-datasetcontrol-parts-edit-columns--overview', text: 'The next part: the user picks the columns of a view.' },
    { title: 'Data providers', iconName: 'Database', href: '?path=/docs/concepts-data-providers--overview', text: 'How a provider decides which columns are searched and what matches.' },
    { title: 'Layout', iconName: 'ViewDashboard', href: '?path=/docs/controls-datasetcontrol-layout--overview', text: 'Where the field sits, and how it turns into a button in a compact header.' },
]

const meta = {
    title: 'Controls/DatasetControl/Parts/Quick find',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { explore: () => <ExploreCards cards={EXPLORE} /> }),
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
}
