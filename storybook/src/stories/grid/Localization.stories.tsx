import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { CzechGridExample } from '../../grid/examples/localizationExamples'

const DESCRIPTION = `
Every string the grid and its modules draw is a label with a key, such as \`grid.noRecordsFound\`. Translate them with a [**LocalizationProvider**](?path=/docs/providers-localizationprovider--overview) around the grid; what you leave out keeps its English default. \`CZECH_LABELS\` holds the Czech translation of every key on this page.

\`\`\`tsx
import { CZECH_LABELS, LocalizationProvider } from '@talxis/base-controls'

const labels = { ...CZECH_LABELS, 'grid.recordLocked': 'Schválený výkaz už nelze upravit.' }

<LocalizationProvider labels={labels}>
    <DatasetControl onLoad={loadTimesheets}>
        <DatasetControl.Body>
            <Grid modules={[createClientSideRowModelModule(), createSortingModule()]} />
        </DatasetControl.Body>
    </DatasetControl>
</LocalizationProvider>
\`\`\`

{{story: Translate the grid into Czech}}

Column names, option labels and formatted values are not labels. They come from the provider: each column's \`displayName\`, the labels in \`metadata.OptionSet\`, and the values it formats. See [**Data**](?path=/docs/grid-data--overview).

## When a change shows

The column menus, header tooltips and the captions of the totals row take their strings as the grid mounts. Overlays, lock tooltips, the save error callout, the filter callout and dialogs follow the provider as it changes. To switch every string at once, give \`<Grid />\` a new \`key\` along with the new labels.

## The grid

| Key | Default |
|---|---|
| \`grid.noRecordsFound\` | No records found. |
| \`grid.valueLocked\` | This value cannot be edited. |
| \`grid.recordLocked\` | This record cannot be edited. |
| \`grid.columnLocked\` | This column cannot be edited. |
| \`grid.recordSaveErrorTitle\` | Your changes were not saved |
| \`grid.recordSaveErrorDismiss\` | Dismiss |

Which lock tooltip shows where is under *Locks* on [**Editing**](?path=/docs/grid-modules-editing--overview).

## Sorting

| Key | Default |
|---|---|
| \`gridSorting.sortTextAscending\`, \`gridSorting.sortTextDescending\` | Sort A to Z, Sort Z to A |
| \`gridSorting.sortDateAscending\`, \`gridSorting.sortDateDescending\` | Sort older to newer, Sort newer to older |
| \`gridSorting.sortNumberAscending\`, \`gridSorting.sortNumberDescending\` | Sort smaller to larger, Sort larger to smaller |
| \`gridSorting.sortTwoOptionsJoint\` | to, as in *No to Yes* |
| \`gridSorting.clear\` | Clear |
| \`gridSorting.menuSection\` | Sorting |

## Filtering

| Key | Default |
|---|---|
| \`gridFiltering.filterMenuFilterBy\` | Filter By |
| \`gridFiltering.apply\` | Apply |
| \`gridFiltering.clear\` | Clear |
| \`gridFiltering.menuSection\` | Filtering |

The operators the filter callout offers have keys of their own:

| Key | Default |
|---|---|
| \`filterOperators.equals\`, \`filterOperators.doesNotEqual\` | Equals, Does not equal |
| \`filterOperators.contains\`, \`filterOperators.doesNotContain\` | Contains, Does not contain |
| \`filterOperators.beginsWith\`, \`filterOperators.doesNotBeginWith\` | Begins with, Does not begin with |
| \`filterOperators.endsWith\`, \`filterOperators.doesNotEndWith\` | Ends with, Does not end with |
| \`filterOperators.containsData\`, \`filterOperators.doesNotContainData\` | Contains data, Does not contain data |
| \`filterOperators.containValues\`, \`filterOperators.doesNotContainValues\` | Contain values, Does not contain values |
| \`filterOperators.in\`, \`filterOperators.notIn\` | In, Not in |
| \`filterOperators.between\`, \`filterOperators.notBetween\` | Between, Not between |
| \`filterOperators.greaterThan\`, \`filterOperators.greaterThanOrEqual\` | Greater than, Greater than or equal to |
| \`filterOperators.lessThan\`, \`filterOperators.lessThanOrEqual\` | Less than, Less than or equal to |
| \`filterOperators.on\`, \`filterOperators.onOrBefore\`, \`filterOperators.onOrAfter\` | On, On or before, On or after |
| \`filterOperators.yesterday\`, \`filterOperators.today\`, \`filterOperators.tomorrow\` | Yesterday, Today, Tomorrow |
| \`filterOperators.lastSevenDays\`, \`filterOperators.nextSevenDays\` | Last 7 days, Next 7 days |
| \`filterOperators.lastWeek\`, \`filterOperators.thisWeek\` | Last week, This week |
| \`filterOperators.lastMonth\`, \`filterOperators.thisMonth\` | Last month, This month |
| \`filterOperators.lastYear\`, \`filterOperators.thisYear\` | Last year, This year |
| \`filterOperators.lastXDays\`, \`filterOperators.nextXDays\` | Last X days, Next X days |
| \`filterOperators.lastXMonths\`, \`filterOperators.nextXMonths\` | Last X months, Next X months |

## Grouping

Keep the \`{{ ... }}\` placeholders when you translate these.

| Key | Default |
|---|---|
| \`gridGrouping.group\`, \`gridGrouping.ungroup\` | Group, Ungroup |
| \`gridGrouping.menuSection\` | Grouping |
| \`gridGrouping.headerTitle\` | Group |
| \`gridGrouping.expandLevel\`, \`gridGrouping.collapseLevel\` | Expand one level, Collapse one level |
| \`gridGrouping.maximumGroupChildrenLimitReached\` | The maximum limit of {{maxGroupChildren}} child records has been reached. Records above this limit will not be loaded. |
| \`gridGrouping.groupSelectionLimitMessage\` | This selection would load the records of more than {{maxGroupLoads}} groups. Select fewer groups, or expand them and select their records. |
| \`gridGrouping.groupSelectionLimitConfirm\` | OK |

## Totals

| Key | Default |
|---|---|
| \`gridAggregation.totalNone\` | None |
| \`gridAggregation.totalSum\`, \`gridAggregation.totalAverage\` | Sum, Average |
| \`gridAggregation.totalMinimum\`, \`gridAggregation.totalMaximum\` | Minimum, Maximum |
| \`gridAggregation.totalCount\` | Count (including empty values) |
| \`gridAggregation.totalCountColumn\` | Count |
| \`gridAggregation.menuSection\` | Totals |

A function's label names it in the column menu, above its figure in the totals row, and in the column's header tooltip.

## In your own module

\`grid.getLabels(set)\` resolves a set of labels as the grid does, such as \`grid.getLabels(GRID_SORTING_LABELS).get('gridSorting.clear')\`. The sets are exported beside the keys: \`GRID_LABELS\`, \`GRID_SORTING_LABELS\`, \`GRID_FILTERING_LABELS\`, \`FILTER_OPERATORS_LABELS\`, \`GRID_GROUPING_LABELS\` and \`GRID_AGGREGATION_LABELS\`.
`

const meta = {
    title: 'Grid/Localization',
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

export const TranslateTheGridIntoCzech: Story = {
    name: 'Translate the grid into Czech',
    render: () => renderStory(<CzechGridExample />),
    parameters: {
        docs: {
            description: {
                story: `Czech timesheets under \`CZECH_LABELS\`, with two labels of their own, from a provider that names its columns and options in Czech. Try: open a column's menu, filter a column, or hover the lock at the start of an approved entry (grouping and totals are AG Grid Enterprise).`,
            },
        },
    },
}
