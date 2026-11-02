import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExpandFromRibbonExample, FilteredTotalsExample, HoursByEmployeeExample, PipelineByManagerExample } from '../../../grid/examples/groupingTotalsExamples'
import { GroupBadgesExample, StockTotalsExample } from '../../../grid/examples/moduleComponentsExamples'

const DESCRIPTION = `
Grouping gathers the rows under a group row for each value of a column, level by level. The aggregation module adds totals, to every group row and to a row pinned under the list. Grouping needs AG Grid Enterprise and totals do not (see [**Modules**](?path=/docs/grid-modules--overview)).

\`\`\`tsx
<DatasetControl onLoad={loadDeals}>
    <DatasetControl.Body>
        <Grid modules={[createClientSideRowModelModule(), createGroupingModule(), createAggregationModule()]} />
    </DatasetControl.Body>
</DatasetControl>
\`\`\`

{{story: Group the pipeline by account manager}}

## What grouping does to the grid

A column offers *Group* and *Ungroup* in its menu when its metadata sets \`CanBeGrouped\` and it is not a multi-select option set. A grouped column shows a group icon before its name, moves to the front, is pinned to the left and cannot be edited; dragging one grouped column ahead of another changes the order of the levels.

While anything is grouped, a narrow column at the far left, \`GROUP_EXPANSION_COLUMN_KEY\`, has a + and a − in its header that open or close one level of groups at a time. A group row shows its value, a chevron and how many records it holds in the column of its level, its totals in the columns that have one, and nothing elsewhere; every cell of a group row is locked.

Record rows take the grid's plain background while anything is grouped, so zebra stripes disappear, and so does a background a cell theme hook below \`GRID_MODULE_PRIORITY.grouping\` sets (see *How hooks run* on [**Hooks**](?path=/docs/grid-extending-hooks--overview)). A \`colDefs\` entry can undo what grouping and totals set on a column: see *Change a column* on [**Columns**](?path=/docs/grid-columns--overview).

## Nested or flat

\`type: 'nested'\`, the default, makes each grouped column a level of its own: a group row stands for one value of its level's column and opens onto the groups of the next level. \`type: 'flat'\` makes one level of groups, one for each combination of values, and every grouped column shows its value on the group row.

{{story: Group hours by employee and day}}

The grid passes \`type\` to the provider when it mounts, and the provider regroups on its next load. To switch, remount the grid with a new \`key\` and refresh the provider.

## Opening groups

\`defaultExpandedLevel\` sets how deep the groups open. Levels count from \`0\`, the top one; the default \`-1\` keeps every group closed, and a number past the deepest level opens everything. A group the user opens or closes keeps that state while every other group follows the level, until \`setExpandedLevel\` or the expansion column's buttons apply a level again and clear what the user toggled. The level and the toggled groups are kept in the grid's state: see [**State**](?path=/docs/grid-state--overview).

{{story: Expand and collapse from the ribbon}}

Whether the groups' records load with the list or as each group opens depends on the row model: see *Row models* on [**Modules**](?path=/docs/grid-modules--overview).

## Grouping and selection

With row selection on, selecting a group row selects every record in it, so the grid loads the records of each newly selected group first, a level at a time. A selection that would load more than \`maxGroupLoadsPerSelection\` groups is refused with an alert worded by \`gridGrouping.groupSelectionLimitMessage\`. On the client-side row model the groups are loaded already. A group that holds more than 5,000 records loads the first 5,000 and says so once per load, worded by \`gridGrouping.maximumGroupChildrenLimitReached\`.

## The totals row

The totals row appears while any column has a total and the list has a record, pinned at the bottom. Each column's menu has a *Totals* section with *None* and the functions in its \`metadata.SupportedAggregations\`, unless \`allowUserAggregation\` is \`false\`.

{{story: Total the filtered list}}

The totals are calculated by a query of their own over the whole list as filtered and searched, not just the page on screen. They show saved data: they update on each load and after each save or delete, but not while a value is being edited. The row shimmers while the totals load, and shows the error across its width if that fails. Changing a total while the rows are grouped reloads the rows, which clears the selection.

## Summary rows

Group rows and the totals row are summary rows: records (\`IRecord\`) like any other, and the grid runs everything for them it runs for a record, from the \`rowSettings\` callbacks and every \`context.cell\` callback to the lock, validation and command hooks, legacy client API expressions and events such as \`onRowClicked\`. Tell them apart by \`record.getDataProvider().getSummarizationType()\`:

| Summarization type | Row |
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

<Grid modules={[...modules, createEditingModule()]} rowSettings={{ onGetLock: lockSubmittedEntries }} />
\`\`\`

Summary rows hold their values under aliases of their own, such as \`status_group\` and \`hours_sum\`, so \`record.getValue('status')\` reads \`null\` on them. A rule that acts on an empty or unmatched value acts on them too: without the guard, this lock would also lock every group row and the totals row. \`grouping.getGroupedValueColumnName\` and \`aggregation.getAggregateValueColumnName\` return the alias to read.

## Preset grouping and totals

Grouping and totals live on the provider, like the sort and the filter: set them before \`refresh()\` and the grid opens grouped and totalled. The calls are under *Groups and totals* on [**Data providers**](?path=/docs/data-providers--overview).

\`\`\`ts
deals.setColumns(columns)
deals.grouping.addGroupBy({ columnName: 'owner', alias: 'owner_group' })
deals.aggregation.addAggregation({ columnName: 'value', alias: 'value_sum', aggregationFunction: 'sum' })
deals.refresh()
\`\`\`

Call \`setColumns\` first: \`addGroupBy\` and \`addAggregation\` write onto the current columns. Name a group alias \`<columnName>_group\` and a total's \`<columnName>_<function>\`, as the column menu does. Levels are ranked by the columns' \`order\`, which \`addGroupBy\`'s second argument sets. \`grouping.clear()\` leaves the columns it ungroups read-only, so remove each level with \`removeGroupBy\` instead.

A grouped column without a total of its own gets \`count\`, which is the number on its group rows and in the totals row; its *Totals* section has no *None*. \`aggregation.getAggregations()\` stays empty while nothing is grouped, so read an ungrouped list's totals from \`provider.getColumns().filter(column => column.aggregation?.aggregationFunction)\`.

## Module options

Both modules' options are read at mount.

| \`createGroupingModule\` option | Type | Default | Description |
|---|---|---|---|
| \`allowUserGrouping\` | \`boolean\` | \`true\` | Whether column menus offer *Group* and *Ungroup*. Preset grouping and \`toggleColumnGroup\` work either way. |
| \`type\` | \`'nested' \\| 'flat'\` | \`'nested'\` | See *Nested or flat*. |
| \`defaultExpandedLevel\` | \`number\` | \`-1\` | The deepest level that opens by itself. |
| \`pinGroupedColumns\` | \`boolean\` | \`true\` | Pins grouped columns to the left. They move to the front either way. |
| \`maxGroupLoadsPerSelection\` | \`number\` | \`100\` | How many groups one selection may load. See *Grouping and selection*. |
| \`components\` | \`IGridGroupingComponents\` | \`{}\` | See *Changing how it looks*. |

| \`createAggregationModule\` option | Type | Default | Description |
|---|---|---|---|
| \`allowUserAggregation\` | \`boolean\` | \`true\` | Whether column menus have a *Totals* section. Preset totals show either way. |
| \`components\` | \`IGridAggregationComponents\` | \`{}\` | See *Changing how it looks*. |

The menu texts, the tooltips and the totals' names are label keys under \`gridGrouping.*\` and \`gridAggregation.*\`: see [**Localization**](?path=/docs/grid-localization--overview).

## From your code

The modules are \`grid.modules.find('grouping')\` and \`grid.modules.find('aggregation')\`, or \`useGridModule\` inside what the grid draws. Neither raises an event when the grouping or the totals change: follow \`onDataLoaded\`.

| \`grouping\` member | Description |
|---|---|
| \`setExpandedLevel(level)\` | Opens the groups down to \`level\` and closes the rest; \`-1\` closes them all and \`getDeepestLevel()\` opens them all. |
| \`getExpandedLevel()\` | The level last applied, no deeper than \`getDeepestLevel()\`. Opening a single group does not change it. |
| \`getDeepestLevel()\` | One less than the number of grouped columns, \`0\` in flat mode, and \`-1\` while nothing is grouped. |
| \`toggleColumnGroup(columnName)\` | Groups by the column, or ungroups it, and reloads. |
| \`toggleGroup(node)\` | Opens or closes one group row. |
| \`isGroupRow(node)\` | Whether the AG Grid row node is a group row. |
| \`isRowGroupedBy(record, columnName)\` | Whether the record is a group row of that column. |
| \`isColumnExpandable(record, columnName)\` | Whether the group row's cell in that column carries the chevron. |
| \`isColumnGrouped(column)\`, \`canColumnBeGrouped(column)\` | Whether the rows are grouped by the column, and whether its menu offers grouping. |
| \`getGroupedValueColumnName(record, columnName)\` | The alias a group row holds the column's value under. |
| \`getGroupedCount(record, columnName)\` | How many records a group row holds, while the grouped column's total is \`count\` or \`countcolumn\`. |
| \`getMaxGroupLoadsPerSelection()\` | The \`maxGroupLoadsPerSelection\` option. |
| \`isGroupSelectionLimitDialogOpen()\`, \`closeGroupSelectionLimitDialog()\` | Whether the alert for a refused selection is open, and closing it. |
| \`events\` | \`onGroupSelectionLimitDialogChanged()\`, when that alert opens or closes. |
| \`components\` | The \`components\` the module was given. |

| \`aggregation\` member | Description |
|---|---|
| \`addAggregation(columnName, aggregationFunction)\` | Totals the column, replacing its total, and names the alias itself, unlike the provider's \`addAggregation({ columnName, alias, aggregationFunction })\`. |
| \`removeAggregation(alias)\` | Removes a total by its alias. |
| \`canColumnBeAggregated(column)\` | Whether the column's menu offers totals. |
| \`getTotalLabel(columnName)\` | What the column's total is called, such as *Sum*. |
| \`getAggregateValueColumnName(record, columnName)\` | The alias a group row or the totals row holds the column's total under. |
| \`components\` | The \`components\` the module was given. |

## Changing how it looks

Both modules take \`components\`, read at mount. How slots work is under *Changing how it looks* on [**Appearance**](?path=/docs/grid-appearance--overview).

\`\`\`tsx
createGroupingModule({ components: { groupCell: { count: { onRenderCount: props => <Badge {...props} /> } } } })
createAggregationModule({ components: { totalCell: { totalValue: { onRenderValue: props => <strong {...props} /> } } } })
\`\`\`

| Module | Key | Slots | Default | Draws |
|---|---|---|---|---|
| Grouping | \`groupingIcon\` | \`onRenderIcon\` | \`GridGroupingIconComponents\` | The icon of a grouped column |
| | \`groupCell.toggle\` | \`onRenderContainer\`, \`onRenderButton\` (with \`isExpanded\`) | \`GroupingUiToggleComponents\` | The chevron of a group |
| | \`groupCell.count\` | \`onRenderCount\` | \`GroupingUiCountComponents\` | How many records the group holds |
| | \`groupCell.container\`, \`loading\`, \`control\`, \`columnControl\`, \`commands\` | As in any cell (see [**Custom cells**](?path=/docs/grid-appearance-custom-cells--overview)) | | The rest of a group's cell |
| Aggregation | \`totalCell.totalValue\` | \`onRenderContainer\`, \`onRenderLabel\`, \`onRenderValue\` | \`AggregationUiTotalValueComponents\` | A total and its label in the totals row |
| | \`totalCell.container\`, \`loading\`, \`commands\` | As in any cell | | The rest of a total's cell |
| | \`aggregateCell.container\`, \`loading\`, \`control\`, \`columnControl\`, \`commands\` | As in any cell | | A total in a group row |

{{story: Show group sizes as badges}}

The cells are \`GroupCell\`, \`TotalCell\` and \`AggregateCell\`, and their own \`components\` prop is laid over the module's key by key: a key you pass replaces the module's for that key. To draw one column's group rows or totals your own way, set its \`cellRendererSelector\` in \`colDefs\`; yours replaces the module's for that column, so return \`undefined\` for the rows it should leave to \`cellRenderer\`, and draw a grouped column's records empty, as the module does.

\`\`\`tsx
const CategoryGroupCell = (props: IGridCellParams) => <GroupCell {...props} components={GROUP_CELL} />
const StockTotalCell = (props: IGridCellParams) => <TotalCell {...props} components={TOTAL} />

const isGroupRow = (params: ICellRendererParams<IRecord>) => params.data?.getDataProvider().getSummarizationType() === 'grouping'

colDefs={{
    category: { cellRendererSelector: params => ({ component: isGroupRow(params) ? CategoryGroupCell : Grid.Cell.EmptyRenderer }) },
    instock: { cellRendererSelector: params => params.node.rowPinned ? { component: StockTotalCell } : undefined },
}}
\`\`\`

The expansion column's header is \`GroupExpansionHeader\`: pass \`headerComponentParams: { components: { expandCollapse } }\` on \`GROUP_EXPANSION_COLUMN_KEY\`, with the slots \`onRenderContainer\`, \`onRenderExpandButton\` and \`onRenderCollapseButton\` (default \`GroupingUiExpandCollapseComponents\`). To change one column's grouping icon, replace the header adornment keyed \`'grouping'\` in its \`context.header.onGetAdornments\`. The alert for a refused selection is the host's own dialog and has no slots.

{{story: Make totals read at a glance}}
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
    name: 'Group the pipeline by account manager',
    render: () => renderStory(<PipelineByManagerExample />),
    parameters: {
        docs: {
            description: {
                story: `Each account manager's pipeline, biggest first: the provider is grouped by \`owner\`, *Value* is summed, and \`defaultExpandedLevel: 0\` opens every group. Try: group by *Stage* too from its menu (AG Grid Enterprise).`,
            },
        },
    },
}

export const HoursByEmployeeAndDay: Story = {
    name: 'Group hours by employee and day',
    render: () => renderStory(<HoursByEmployeeExample />),
    parameters: {
        docs: {
            description: {
                story: `Last week's hours per person and per day, with *Hours* summed on every group row. Try: switch between \`type: 'nested'\` and \`type: 'flat'\`; the grid remounts with a new \`key\` and the provider regroups.`,
            },
        },
    },
}

export const ExpandAndCollapseFromTheRibbon: Story = {
    name: 'Expand and collapse from the ribbon',
    render: () => renderStory(<ExpandFromRibbonExample />),
    parameters: {
        docs: {
            description: {
                story: `Timesheets by status, then by employee, with a ribbon that calls \`grouping.setExpandedLevel\` through the grid from \`onReady\`. Try: expand one level, then expand all.`,
            },
        },
    },
}

export const TotalsForTheFilteredList: Story = {
    name: 'Total the filtered list',
    render: () => renderStory(<FilteredTotalsExample />),
    parameters: {
        docs: {
            description: {
                story: `The provider counts the deals and sums *Value* over whatever the pipeline is filtered to. Try: filter *Stage* to Negotiate, then pick *Average* under *Totals* in the *Probability (%)* menu.`,
            },
        },
    },
}

export const GroupSizesAsBadges: Story = {
    name: 'Show group sizes as badges',
    render: () => renderStory(<GroupBadgesExample />),
    parameters: {
        docs: {
            description: {
                story: `\`groupCell.count\` draws each category's size as a badge, and \`groupingIcon\` colours the Category header's icon. Try: group by another column from its menu.`,
            },
        },
    },
}

export const TotalsThatReadAtAGlance: Story = {
    name: 'Make totals read at a glance',
    render: () => renderStory(<StockTotalsExample />),
    parameters: {
        docs: {
            description: {
                story: `\`totalCell.totalValue\` draws the label small and uppercase and the value bold and blue, with In stock summed and Price averaged. Try: pick another total from a column's menu.`,
            },
        },
    },
}
