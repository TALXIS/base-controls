import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { CzechExample } from '../../dataset-control/examples/localizationExamples'

const DESCRIPTION = `
Every string the control and its parts show can be replaced through their \`labels\`. What you leave out keeps its English default, exported for each part. A label with \`{{ name }}\` in it is filled in.

\`\`\`tsx
<DatasetControl onLoad={loadDeals} labels={{ unsavedChangesConfirmation: 'Zahodit neuložené změny?' }}>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <DatasetControl.QuickFind labels={{ searchPlaceholder: 'Hledat {{ collection }}' }} />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    ...
</DatasetControl>
\`\`\`

- The control's own \`labels\` are read once, at mount; a part's follow its prop.

{{story: Translate into Czech}}

| Part | Keys | Defaults |
|---|---|---|
| \`DatasetControl\` | \`unsavedChangesConfirmation\` | \`DATASET_CONTROL_LABELS\` |
| \`ViewSwitcher\` | \`ungroupedViewsHeader\` | \`VIEW_SWITCHER_LABELS\` |
| \`createUserQueriesModule\` | \`myViewsHeader\`, \`saveChanges\`, \`saveAsNewView\`, \`manageViews\`, \`viewName\` (the prompt for a new view's name), \`save\`, \`delete\`, \`confirmDeleteViews\`, \`close\`, \`saveFailed\` and \`deleteFailed\` (when a failed save or delete gives no reason) | \`USER_QUERIES_LABELS\` |
| \`QuickFind\` | \`searchPlaceholder\` (with \`{{ collection }}\`), \`defaultCollectionName\`, \`leadingWildcardWarning\`, \`columnsHintStart\`, \`columnsHintOperator\`, \`columnsHintEnd\` | \`QUICK_FIND_LABELS\` |
| \`EditColumns\` | \`editColumns\`, \`save\`, \`cancel\`, \`scopeSelectorLabel\`, \`columnSelectorPlaceholder\`, \`customColumnTooltip\`, \`unnamed\`, \`noResults\`, \`loading\` | \`EDIT_COLUMNS_LABELS\` |
| \`Notifications\` | \`groupedNotificationsSummary\` (with \`{{ count }}\`) | \`DATASET_CONTROL_NOTIFICATIONS_LABELS\` |
| \`EmptyRecords\` | \`noRecordsFound\` | \`EMPTY_RECORDS_LABELS\` |
| \`Pagination\` | \`firstPageTooltip\`, \`previousPageTooltip\`, \`nextPageTooltip\`, \`currentPage\` (with \`{{ number }}\`) | \`PAGINATION_LABELS\` |
| \`PageSizeSwitcher\` | \`recordRange\` (with \`{{ start }}\` and \`{{ end }}\`), \`recordTotal\` (with \`{{ total }}\`), \`pageSizeTooltip\` | \`PAGE_SIZE_SWITCHER_LABELS\` |

The grid's strings are the grid's own \`labels\`: see [**Grid › Localization**](?path=/docs/grid-localization--overview). View names come from \`onLoadViews\`, and column names from the provider.
`

const meta = {
    title: 'DatasetControl/Localization',
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

export const InCzech: Story = {
    name: 'Translate into Czech',
    render: () => renderStory(<CzechExample />),
    parameters: {
        docs: {
            description: {
                story: `The control, the view switcher, quick find, column editing and paging, and the grid, in Czech. Try: open the column editor and focus the search box.`,
            },
        },
    },
}
