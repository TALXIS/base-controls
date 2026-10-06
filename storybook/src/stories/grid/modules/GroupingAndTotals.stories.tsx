import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExpandFromToolbarExample, FilteredTotalsExample, HoursByEmployeeExample, PipelineByManagerExample } from '../../../grid/examples/groupingTotalsExamples'

const DESCRIPTION = `
Grouping gathers the rows under a group row for each value of a column, level by level. The aggregation module adds totals, to every group row and to a row pinned under the list. Grouping uses AG Grid Enterprise and totals do not; the licence is on [**Modules**](?path=/docs/grid-modules--overview).

{{story: Pipeline by account manager}}

## What grouping does to the grid

- A column's menu has a *Grouping* section with *Group* or *Ungroup* when \`metadata.CanBeGrouped\` is set and the column is not a multi-select option set. A grouped column shows a group icon before its name.
- Grouped columns move to the front, are pinned to the left and cannot be edited. Dragging one ahead of another changes the order of the levels.
- While anything is grouped, a narrow column at the far left (\`GROUP_EXPANSION_COLUMN_KEY\`, \`'groupExpansion'\`) has a + and a − in its header that open or close one level of groups at a time.
- A group row shows its value, a chevron and how many records it holds in the column of its level, the group's totals in the columns that have one, and nothing elsewhere. Every cell of a group row is locked.
- Ungrouping a column from its menu also removes its total.
- While anything is grouped, record rows take the grid's plain background: zebra stripes disappear, and so does the background a cell theme hook below \`GRID_MODULE_PRIORITY.grouping\` sets. How to keep yours is under *The order theme decisions run in* on [**Appearance**](?path=/docs/grid-appearance--overview).
- A \`colDefs\` entry can undo what grouping and totals set on a column: see *Changing a column* on [**Columns**](?path=/docs/grid-columns-overview--overview).

## Preset grouping and totals

Grouping and totals live on the provider, like the sort and the filter: set them before \`refresh()\` and the grid opens grouped and totalled. Call \`setColumns\` first: \`addGroupBy\` and \`addAggregation\` write onto the provider's current columns, so a \`setColumns\` call after them drops what they set. The sort and the filter can go in any time before \`refresh()\`.

\`\`\`ts
deals.setColumns(columns)
deals.grouping.addGroupBy({ columnName: 'owner', alias: 'owner_group' })
deals.aggregation.addAggregation({ columnName: 'value', alias: 'value_sum', aggregationFunction: 'sum' })
deals.setSorting([{ name: 'value', sortDirection: 1 }])
deals.refresh()
\`\`\`

| Call | What it does |
|---|---|
| \`grouping.addGroupBy({ columnName, alias }, order?)\` | Groups by the column, as a level below the ones grouped before it. The alias is always \`<columnName>_group\`, whatever you pass. Levels are ranked by the columns' \`order\`, and the \`order\` argument sets this column's. |
| \`grouping.removeGroupBy(alias)\`, \`grouping.clear()\` | Remove one level by that alias, or all of them. \`clear()\` leaves the columns it ungroups read-only, so remove each level with \`removeGroupBy\` to make them editable again. |
| \`grouping.getGroupBys()\` | The levels, as \`{ columnName, alias }\`. |
| \`aggregation.addAggregation({ columnName, alias, aggregationFunction })\` | Totals the column, replacing the total it had. Name the alias \`<columnName>_<function>\`, as the column menu does. |
| \`aggregation.removeAggregation(alias)\`, \`aggregation.clear()\` | Remove one total, or all of them. |

- \`aggregationFunction\` is \`sum\`, \`avg\`, \`min\`, \`max\`, \`count\` (rows) or \`countcolumn\` (rows with a value in the column). Which of them a column's menu offers is its \`metadata.SupportedAggregations\`, with the provider's defaults on [**Data**](?path=/docs/grid-get-started-data--overview).
- A grouped column without a total of its own gets \`count\`: that is the number on its group rows. With the aggregation module on, the totals row shows that count too. A grouped column's *Totals* section has no *None*.
- \`aggregation.getAggregations()\` stays empty while nothing is grouped. To read an ungrouped list's totals, use \`provider.getColumns().filter(column => column.aggregation?.aggregationFunction)\`.

## Nested or flat

{{story: Hours by employee and day}}

- \`type: 'nested'\`, the default, makes each grouped column a level of its own. A group row stands for one value of its level's column, and opens onto the groups of the next level.
- \`type: 'flat'\` makes one level of groups, one for each combination of values, and every grouped column shows its value on the group row.

The grid hands \`type\` to the provider when it mounts, and the provider regroups by it on its next load. To switch, remount the grid with a new \`key\` and refresh the provider.

## Opening groups

\`defaultExpandedLevel\` sets how deep the groups open as they appear. Levels count from \`0\`, the top one, and the default \`-1\` keeps every group closed; any number past the deepest level opens everything. Once someone opens or closes a single group, groups that appear later stay closed until \`setExpandedLevel\` or the expansion column's buttons apply a level again.

{{story: Expand and collapse from a toolbar}}

Whether the groups' records load with the list or as each group opens depends on the row model: see *Row models* on [**Modules**](?path=/docs/grid-modules--overview).

## The totals row

{{story: Totals for the filtered list}}

- It appears while any column has a total and the list has a record, and it is always pinned at the bottom.
- It is worked out by a query of its own over the whole list as filtered and searched, not just the page the grid shows.
- It shows saved data. It updates on each load of the provider, after \`provider.save()\`, and with the editing module's \`autoSave\` after each record saves, but not while a value is being edited.
- It shimmers while the totals are worked out, and shows the error across its width if that fails.
- Each column's menu has a *Totals* section with *None* and the functions the column supports, unless \`allowUserAggregation\` is \`false\`.

## Group rows and the totals row are records too

A group row and the totals row are records (\`IRecord\`) like any other, and the grid asks about them everything it asks about a record: the \`rowSettings\` callbacks, every \`settings.cell\` callback, the cell, lock, validation and command hooks, legacy client API notifications, and events such as \`onRowClicked\` and \`onCellDoubleClicked\`. Tell them apart by their provider's summarization type:

| \`record.getDataProvider().getSummarizationType()\` | The row |
|---|---|
| \`'none'\` | A record |
| \`'grouping'\` | A group row |
| \`'aggregation'\` | The totals row |

\`\`\`tsx
const DRAFT = 1
const REJECTED = 4

const isSummaryRow = (record: IRecord) => record.getDataProvider().getSummarizationType() !== 'none'

const lockSubmittedEntries = (result: IGridLock, { record }: { record: IRecord }) => {
    if (!isSummaryRow(record) && ![DRAFT, REJECTED].includes(Number(record.getValue('status')))) {
        result.isLocked = true
    }
}

<Grid.Root provider={timesheets} modules={{ ...modules, editing: createEditingModule() }} rowSettings={{ onGetLock: lockSubmittedEntries }} />
\`\`\`

These rows hold their values under aliases of their own, such as \`status_group\` and \`hours_sum\`, so \`record.getValue('status')\` reads \`null\` on them. A rule that acts on an empty or unmatched value acts on them too: without the guard, this lock would also lock every group row and the totals row.

## Module options

Every option is read once, when the grid mounts: to change one, remount the grid with a new \`key\`.

| \`createGroupingModule\` | Default | What it does |
|---|---|---|
| \`allowUserGrouping\` | \`true\` | Whether column menus offer *Group* and *Ungroup*. Grouping you preset, or set with \`toggleColumnGroup\`, works either way. |
| \`type\` | \`'nested'\` | \`'nested'\` or \`'flat'\`, see *Nested or flat*. |
| \`defaultExpandedLevel\` | \`-1\` | The deepest level that opens as it appears. \`-1\` keeps every group closed. |
| \`pinGroupedColumns\` | \`true\` | Pins grouped columns to the left. They move to the front either way. |
| \`maxGroupLoadsPerSelection\` | \`100\` | With row selection, how many groups a selection may load the records of before it is refused with an alert. On the client-side row model the groups are loaded already. |
| \`labels\`, \`components\` | | See below. |

| \`createAggregationModule\` | Default | What it does |
|---|---|---|
| \`allowUserAggregation\` | \`true\` | Whether column menus have a *Totals* section. Totals you preset show either way. |
| \`labels\`, \`components\` | | See below. |

## The grouping and aggregation services

Reach them with \`runtime.services.get('grouping')\` and \`runtime.services.get('aggregation')\` from \`onGridReady\` or a module of your own, or with \`useGridService\` inside anything the grid draws. Neither raises an event when the grouping or the totals change.

| \`grouping\` | What it does |
|---|---|
| \`setExpandedLevel(level)\` | Opens the groups down to \`level\` and closes the rest. \`-1\` closes them all, and \`getDeepestLevel()\` opens them all. |
| \`getExpandedLevel()\` | The level last applied by \`defaultExpandedLevel\`, \`setExpandedLevel\` or the expansion column. Opening a single group does not change it. |
| \`getDeepestLevel()\` | One less than the number of grouped columns, \`0\` in flat mode, and \`-1\` while nothing is grouped. |
| \`toggleColumnGroup(columnName)\` | Groups by the column, or ungroups it when it is grouped, and reloads. |
| \`isColumnGrouped(column)\` | Whether the rows are grouped by the column. |
| \`canColumnBeGrouped(column)\` | Whether the column's menu offers grouping, \`allowUserGrouping\` included. |
| \`getGroupedCount(record, columnName)\` | How many records a group row holds, while the grouped column's total is a count. |

| \`aggregation\` | What it does |
|---|---|
| \`addAggregation(columnName, aggregationFunction)\` | Totals the column, replacing the total it had, and works the totals out again. |
| \`removeAggregation(alias)\` | Removes a total by its alias, \`<columnName>_<function>\`. |
| \`canColumnBeAggregated(column)\` | Whether the column's menu offers totals, \`allowUserAggregation\` included. |
| \`getTotalLabel(columnName)\` | What the column's total is called, such as *Sum*. |

## Labels

Pass any of these keys as the module's \`labels\`. The grid's own \`labels\` prop does not cover them; localization as a whole is on [**Localization**](?path=/docs/grid-localization-overview--overview). Keep the \`{{...}}\` placeholders in a translation.

| \`createGroupingModule({ labels })\` | Default | Where it shows |
|---|---|---|
| \`group\`, \`ungroup\` | Group, Ungroup | The column menu item |
| \`menuSection\` | Grouping | The section's heading |
| \`headerTitle\` | Group | Added to a grouped column's header tooltip |
| \`expandLevel\`, \`collapseLevel\` | Expand one level, Collapse one level | The tooltips of the expansion column's + and − |
| \`maximumGroupChildrenLimitReached\` | The maximum limit of {{maxGroupChildren}} child records has been reached. Records above this limit will not be loaded. | The error when a group holds more than 5000 records |
| \`groupSelectionLimitMessage\` | This selection would load the records of more than {{maxGroupLoads}} groups. Select fewer groups, or expand them and select their records. | The alert that refuses a selection over \`maxGroupLoadsPerSelection\` |
| \`groupSelectionLimitConfirm\` | OK | That alert's button |

| \`createAggregationModule({ labels })\` | Default | Where it shows |
|---|---|---|
| \`totalNone\` | None | The menu item that removes the column's total |
| \`totalSum\`, \`totalAverage\` | Sum, Average | \`sum\`, \`avg\` |
| \`totalMinimum\`, \`totalMaximum\` | Minimum, Maximum | \`min\`, \`max\` |
| \`totalCount\` | Count (including empty values) | \`count\` |
| \`totalCountColumn\` | Count | \`countcolumn\` |
| \`menuSection\` | Totals | The section's heading |

A function's label is its menu item, the caption above the figure in the totals row, and part of the column's header tooltip.

## Components

Each module's \`components\` option replaces what it draws, by piece. How to write a replacement is on [**Overlays and modules**](?path=/docs/grid-appearance-overlays-and-modules--overview).

| \`createGroupingModule({ components })\` | Replaces |
|---|---|
| \`groupingIcon.onRenderIcon\` | The icon before a grouped column's name |
| \`groupCell.toggle.onRenderContainer\`, \`onRenderButton\` | The chevron on a group row. The button's props carry \`isExpanded\`. |
| \`groupCell.count.onRenderCount\` | The record count after the group's value |
| \`groupCell.container\`, \`loading\`, \`control\`, \`columnControl\`, \`commands\` | The group cell's frame, shimmer, value and commands, as in any cell |
| \`expansionHeader.expandCollapse.onRenderContainer\`, \`onRenderExpandButton\`, \`onRenderCollapseButton\` | The + and − in the expansion column's header |

| \`createAggregationModule({ components })\` | Replaces |
|---|---|
| \`totalCell.totalValue.onRenderContainer\`, \`onRenderLabel\`, \`onRenderValue\` | A total in the totals row: its caption and its figure |
| \`totalCell.container\`, \`loading\`, \`commands\` | The totals cell's frame, shimmer and commands |
| \`aggregateCell.container\`, \`loading\`, \`control\`, \`columnControl\`, \`commands\` | A total in a group row |

The group selection alert and the error for an oversized group open through the PCF context's \`navigation\` dialogs, so no component replaces them.
`

const meta = {
    title: 'Grid/Modules/Grouping and totals',
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

export const PipelineByAccountManager: Story = {
    name: 'Pipeline by account manager',
    render: () => renderStory(<PipelineByManagerExample />),
    parameters: {
        docs: {
            description: {
                story: `A sales director reviews each account manager's pipeline, biggest first: the provider is grouped by \`owner\` with \`grouping.addGroupBy\`, \`aggregation.addAggregation\` sums *Value* and averages *Probability (%)*, \`setSorting\` on *Value* ranks the managers by their sum, and \`defaultExpandedLevel: 0\` opens every group. Group by *Stage* too from its menu, or pick another total for *Value*.`,
            },
        },
    },
}

export const HoursByEmployeeAndDay: Story = {
    name: 'Hours by employee and day',
    render: () => renderStory(<HoursByEmployeeExample />),
    parameters: {
        docs: {
            description: {
                story: `A team lead checks last week's hours per person and per day, with *Hours* summed on every group row and in the totals row. Switch between \`type: 'nested'\` and \`type: 'flat'\`: the grid remounts with a new \`key\`, because \`type\` is read at mount, and the provider reloads to regroup.`,
            },
        },
    },
}

export const ExpandAndCollapseFromAToolbar: Story = {
    name: 'Expand and collapse from a toolbar',
    render: () => renderStory(<ExpandFromToolbarExample />),
    parameters: {
        docs: {
            description: {
                story: `A manager reviews the week's timesheets by status, then by employee. \`onGridReady\` hands over the runtime, kept in a ref, and the toolbar calls \`grouping.setExpandedLevel\` with \`getExpandedLevel()\` and \`getDeepestLevel()\`. Expand one level to see whose entries wait under *Submitted*, then expand all.`,
            },
        },
    },
}

export const TotalsForTheFilteredList: Story = {
    name: 'Totals for the filtered list',
    render: () => renderStory(<FilteredTotalsExample />),
    parameters: {
        docs: {
            description: {
                story: `Finance wants the totals of whatever the pipeline is filtered to. The provider counts the deals and sums *Value* with \`aggregation.addAggregation\`; filter *Stage* to Negotiate and the totals row covers only those deals. Then pick *Average* under *Totals* in the *Probability (%)* menu to add a total of your own.`,
            },
        },
    },
}
