import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { CzechExample } from '../../dataset-control/examples/localizationExamples'

const DESCRIPTION = `
Every string the control, its parts and the user views show is a label with a key, such as \`quickFind.searchPlaceholder\`. \`LocalizationProvider\` replaces them for everything below it, and \`CZECH_LABELS\` holds the Czech translation of every label. How labels, placeholders and nested providers work is on [**LocalizationProvider**](?path=/docs/providers-localizationprovider--overview).

\`\`\`tsx
const labels = { ...CZECH_LABELS, 'quickFind.searchPlaceholder': 'Hledat obchody...' }

<LocalizationProvider labels={labels}>
    <DatasetControl onLoad={loadDeals}>...</DatasetControl>
</LocalizationProvider>
\`\`\`

{{story: Translate into Czech}}

## The control

| Key | Default |
|---|---|
| \`dataset.unsavedChangesConfirmation\` | This action will discard all unsaved changes. Would you like to continue? |

## Views

| Key | Default |
|---|---|
| \`viewSwitcher.ungroupedViewsHeader\` | System views |
| \`userQueries.myViewsHeader\` | My views |
| \`userQueries.saveChanges\`, \`userQueries.saveAsNewView\`, \`userQueries.manageViews\` | Save changes, Save as new view, Manage views |
| \`userQueries.viewName\` | Name |
| \`userQueries.save\`, \`userQueries.delete\`, \`userQueries.close\` | Save, Delete, Close |
| \`userQueries.confirmDeleteViews\` | Do you want to delete the selected views? |
| \`userQueries.saveFailed\`, \`userQueries.deleteFailed\` | The view could not be saved., The view could not be deleted. |

\`userQueries.viewName\` is the prompt for a new view's name and the name column in *Manage views*.

## Quick find

| Key | Default |
|---|---|
| \`quickFind.searchPlaceholder\` | Search {{ collection }}... |
| \`quickFind.defaultCollectionName\` | records |
| \`quickFind.leadingWildcardWarning\` | For faster results, don't start with an asterisk (*) |
| \`quickFind.columnsHintStart\`, \`quickFind.columnsHintOperator\`, \`quickFind.columnsHintEnd\` | Apply, begins with, filter on these columns: |

\`{{ collection }}\` is the provider's plural entity name, or \`quickFind.defaultCollectionName\`.

## Edit columns

| Key | Default |
|---|---|
| \`editColumns.editColumns\` | Edit columns |
| \`editColumns.save\`, \`editColumns.cancel\` | Save, Cancel |
| \`editColumns.scopeSelectorLabel\` | Column source |
| \`editColumns.columnSelectorPlaceholder\` | Add column... |
| \`editColumns.customColumnTooltip\` | User column |
| \`editColumns.unnamed\` | (No name) |
| \`editColumns.noResults\`, \`editColumns.loading\` | No results found., Loading... |

## Paging

| Key | Default |
|---|---|
| \`pagination.firstPageTooltip\`, \`pagination.previousPageTooltip\`, \`pagination.nextPageTooltip\` | First page, Previous, Next |
| \`pagination.currentPage\` | Page {{ number }} |
| \`pageSizeSwitcher.recordRange\` | {{ start }} - {{ end }} |
| \`pageSizeSwitcher.recordTotal\` | of {{ total }} |
| \`pageSizeSwitcher.pageSizeTooltip\` | Records per page |

## Notifications and empty records

| Key | Default |
|---|---|
| \`notifications.groupedNotificationsSummary\` | You have {{ count }} notifications. Select to view them. |
| \`emptyRecords.noRecordsFound\` | No records found. |

Each set is exported with its Czech translation, such as \`QUICK_FIND_LABELS\` and \`QUICK_FIND_LABELS_CS\`: \`DATASET_CONTROL_LABELS\`, \`VIEW_SWITCHER_LABELS\`, \`USER_QUERIES_LABELS\`, \`EDIT_COLUMNS_LABELS\`, \`PAGINATION_LABELS\`, \`PAGE_SIZE_SWITCHER_LABELS\`, \`DATASET_CONTROL_NOTIFICATIONS_LABELS\` and \`EMPTY_RECORDS_LABELS\`. The same provider translates the Grid: see [**Grid › Localization**](?path=/docs/grid-localization--overview). View names come from \`onLoadViews\`, and column names from the provider.
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
                story: `The control, its parts, the user views and the grid under \`CZECH_LABELS\`, with a placeholder of its own. Try: open the view switcher and the column editor, click the search box, then change a label in **Code**.`,
            },
        },
    },
}
