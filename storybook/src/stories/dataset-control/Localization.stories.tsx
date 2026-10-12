import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { CzechExample } from '../../dataset-control/examples/localizationExamples'

const DESCRIPTION = `Every string a part shows can be replaced through its \`labels\`. What you leave out keeps its English default, exported for each part. A label with \`{{ name }}\` in it is filled in.

{{story: In Czech}}

| Part | Labels | Defaults |
|---|---|---|
| \`DatasetControl\` | \`unsavedChangesConfirmation\` | \`DATASET_CONTROL_LABELS\` |
| \`ViewSwitcher\` | \`ungroupedViewsHeader\` | \`VIEW_SWITCHER_LABELS\` |
| \`QuickFind\` | \`searchPlaceholder\` (with \`{{ collection }}\`), \`defaultCollectionName\`, \`leadingWildcardWarning\`, \`columnsHintStart\`, \`columnsHintOperator\`, \`columnsHintEnd\` | \`QUICK_FIND_LABELS\` |
| \`EditColumns\` | \`editColumns\`, \`save\`, \`cancel\`, \`scopeSelectorLabel\`, \`columnSelectorPlaceholder\`, \`customColumnTooltip\`, \`unnamed\`, \`noResults\` | \`EDIT_COLUMNS_LABELS\` |
| \`Notifications\` | \`groupedNotificationsSummary\` (with \`{{ count }}\`) | \`DATASET_CONTROL_NOTIFICATIONS_LABELS\` |
| \`EmptyRecords\` | \`noRecordsFound\` | \`EMPTY_RECORDS_LABELS\` |
| \`Pagination\` | \`firstPageTooltip\`, \`previousPageTooltip\`, \`nextPageTooltip\`, \`currentPage\` (with \`{{ number }}\`) | \`PAGINATION_LABELS\` |
| \`PageSizeSwitcher\` | \`recordRange\` (with \`{{ start }}\` and \`{{ end }}\`), \`recordTotal\` (with \`{{ total }}\`), \`pageSizeTooltip\` | \`PAGE_SIZE_SWITCHER_LABELS\` |

The grid's strings are the grid's own \`labels\`: see [**Localization**](?path=/docs/grid-localization--overview) of the grid. View and column names come from \`onLoad\` and the provider.
`

const meta = {
    title: 'DatasetControl/Localization/Overview',
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
    name: 'In Czech',
    render: () => renderStory(<CzechExample />),
    parameters: {
        docs: {
            description: {
                story: `Every part, and the grid, in Czech. Open the column editor and focus the search to see more of them.`,
            },
        },
    },
}
