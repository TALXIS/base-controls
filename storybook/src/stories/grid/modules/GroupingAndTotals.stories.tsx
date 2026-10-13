import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExpandFromRibbonExample, FilteredTotalsExample, HoursByEmployeeExample, PipelineByManagerExample } from '../../../grid/examples/groupingTotalsExamples'
import { GroupBadgesExample, StockTotalsExample } from '../../../grid/examples/moduleComponentsExamples'

const DESCRIPTION = `
Grouping gathers the rows under a group row for each value of a column, level by level. The aggregation module adds totals, to every group row and to a row pinned under the list. Grouping needs AG Grid Enterprise and totals do not: see [**Modules**](?path=/docs/grid-modules--overview).

\`\`\`tsx
<DatasetControl onLoad={loadDeals}>
    <DatasetControl.Body>
        <Grid modules={{ rowModel: createClientSideRowModelModule(), grouping: createGroupingModule(), aggregation: createAggregationModule() }} />
    </DatasetControl.Body>
</DatasetControl>
\`\`\`

{{story: Group the pipeline by account manager}}

## What grouping does to the grid

- A column's menu has a *Grouping* section with *Group* or *Ungroup* when \`metadata.CanBeGrouped\` is set and the column is not a multi-select option set. A grouped column shows a group icon before its name.
- Grouped columns move to the front, are pinned to the left and cannot be edited. Dragging one ahead of another changes the order of the levels.
- While anything is grouped, a narrow column at the far left (\`GROUP_EXPANSION_COLUMN_KEY\`, \`'groupExpansion'\`) has a + and a − in its header that open or close one level of groups at a time.
- A group row shows its value, a chevron and how many records it holds in the column of its level, the group's totals in the columns that have one, and nothing elsewhere. Every cell of a group row is locked.
- Ungrouping a column from its menu also removes its total.
- While anything is grouped, record rows take the grid's plain background: zebra stripes disappear, and so does the background a cell theme hook below \`GRID_MODULE_PRIORITY.grouping\` sets. To keep yours, see *How hooks run* on [**Hooks**](?path=/docs/grid-extending-hooks--overview).
- A \`colDefs\` entry can undo what grouping and totals set on a column: see *Change a column* on [**Columns**](?path=/docs/grid-columns--overview).

## Nested or flat

\`type: 'nested'\`, the default, makes each grouped column a level of its own: a group row stands for one value of its level's column, and opens onto the groups of the next level. \`type: 'flat'\` makes one level of groups, one for each combination of values, and every grouped column shows its value on the group row.

{{story: Group hours by employee and day}}

The grid passes \`type\` to the provider when it mounts, and the provider regroups by it on its next load. To switch, remount the grid with a new \`key\` and refresh the provider.

## Opening groups

\`defaultExpandedLevel\` sets how deep the groups open as they appear. Levels count from \`0\`, the top one, and the default \`-1\` keeps every group closed; any number past the deepest level opens everything. Once someone opens or closes a single group, groups that appear later stay closed until \`setExpandedLevel\` or the expansion column's buttons apply a level again.

{{story: Expand and collapse from the ribbon}}

Whether the groups' records load with the list or as each group opens depends on the row model: see *Row models* on [**Modules**](?path=/docs/grid-modules--overview).

## The totals row

The totals row appears while any column has a total and the list has a record, pinned at the bottom. Each column's menu has a *Totals* section with *None* and the functions the column supports, unless \`allowUserAggregation\` is \`false\`.

{{story: Total the filtered list}}

- It is calculated by a query of its own over the whole list as filtered and searched, not just the page the grid shows.
- It shows saved data. It updates on each load of the provider and after each record saves, but not while a value is being edited.
- It shimmers while the totals are calculated, and shows the error across its width if that fails.
- Changing a total while the rows are grouped reloads the rows, which clears the selection.

## Summary rows

Group rows and the totals row are summary rows: records (\`IRecord\`) like any other, and the grid runs everything for them it runs for a record: the \`rowSettings\` callbacks, every \`context.cell\` callback, the cell, lock, validation and command hooks, legacy client API notifications, and events such as \`onRowClicked\` and \`onCellDoubleClicked\`. Tell them apart by \`record.getDataProvider().getSummarizationType()\`:

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

<DatasetControl onLoad={loadTimesheets}>
    <DatasetControl.Body>
        <Grid modules={{ ...modules, editing: createEditingModule() }} rowSettings={{ onGetLock: lockSubmittedEntries }} />
    </DatasetControl.Body>
</DatasetControl>
\`\`\`

These rows hold their values under aliases of their own, such as \`status_group\` and \`hours_sum\`, so \`record.getValue('status')\` reads \`null\` on them. A rule that acts on an empty or unmatched value acts on them too: without the guard, this lock would also lock every group row and the totals row.

## Preset grouping and totals

Grouping and totals live on the provider, like the sort and the filter: set them before \`refresh()\` and the grid opens grouped and totalled. The calls are under *Groups and totals* on [**Data providers**](?path=/docs/data-providers--overview).

\`\`\`ts
deals.setColumns(columns)
deals.grouping.addGroupBy({ columnName: 'owner', alias: 'owner_group' })
deals.aggregation.addAggregation({ columnName: 'value', alias: 'value_sum', aggregationFunction: 'sum' })
deals.refresh()
\`\`\`

- Call \`setColumns\` before \`addGroupBy\` and \`addAggregation\`, which write onto the current columns.
- Name a group alias \`<columnName>_group\` and a total's \`<columnName>_<function>\`, as the column menu does.
- Levels are ranked by the columns' \`order\`; \`addGroupBy\`'s second argument sets this column's.
- \`grouping.clear()\` leaves the columns it ungroups read-only, so remove each level with \`removeGroupBy\` to make them editable again.
- Which functions a column's menu offers is its \`metadata.SupportedAggregations\`, with the provider's defaults on [**Data**](?path=/docs/grid-data--overview).
- A grouped column without a total of its own gets \`count\`: that is the number on its group rows, and the totals row shows it too. A grouped column's *Totals* section has no *None*.
- \`aggregation.getAggregations()\` stays empty while nothing is grouped. To read an ungrouped list's totals, use \`provider.getColumns().filter(column => column.aggregation?.aggregationFunction)\`.

## Module options

| \`createGroupingModule\` option | Type | Default | Description |
|---|---|---|---|
| \`allowUserGrouping\` | \`boolean\` | \`true\` | Whether column menus offer *Group* and *Ungroup*. Preset grouping, or \`toggleColumnGroup\`, works either way. |
| \`type\` | \`'nested' \\| 'flat'\` | \`'nested'\` | See *Nested or flat* above. |
| \`defaultExpandedLevel\` | \`number\` | \`-1\` | The deepest level that opens as it appears. \`-1\` keeps every group closed. |
| \`pinGroupedColumns\` | \`boolean\` | \`true\` | Pins grouped columns to the left. They move to the front either way. |
| \`maxGroupLoadsPerSelection\` | \`number\` | \`100\` | With row selection, how many groups a selection may load the records of before it is refused with an alert. On the client-side row model the groups are loaded already. |
| \`labels\` | \`Partial<IGridGroupingLabels>\` | English | See [**Localization**](?path=/docs/grid-localization--overview). |
| \`components\` | \`IGridGroupingComponents\` | \`{}\` | See *Changing how it looks* below. |

| \`createAggregationModule\` option | Type | Default | Description |
|---|---|---|---|
| \`allowUserAggregation\` | \`boolean\` | \`true\` | Whether column menus have a *Totals* section. Preset totals show either way. |
| \`labels\` | \`Partial<IGridAggregationLabels>\` | English | See [**Localization**](?path=/docs/grid-localization--overview). |
| \`components\` | \`IGridAggregationComponents\` | \`{}\` | See *Changing how it looks* below. |

Both modules' options are read at mount: see *Change a prop that is read at mount* on [**Props and events**](?path=/docs/grid-props-and-events--overview).

## From your code

The grouping and aggregation modules' services are \`grid.services.find('grouping')\` and \`grid.services.find('aggregation')\`, or \`useGridService\` in a part the grid draws. Each is \`undefined\` without its module. Neither raises an event when the grouping or the totals change: follow \`onDataLoaded\`.

| \`grouping\` member | Description |
|---|---|
| \`setExpandedLevel(level)\` | Opens the groups down to \`level\` and closes the rest. \`-1\` closes them all, and \`getDeepestLevel()\` opens them all. |
| \`getExpandedLevel()\` | The level last applied by \`defaultExpandedLevel\`, \`setExpandedLevel\` or the expansion column. Opening a single group does not change it. |
| \`getDeepestLevel()\` | One less than the number of grouped columns, \`0\` in flat mode, and \`-1\` while nothing is grouped. |
| \`toggleColumnGroup(columnName)\` | Groups by the column, or ungroups it when it is grouped, and reloads. |
| \`toggleGroup(node)\` | Opens or closes one group row. |
| \`isGroupRow(node)\` | Whether the AG Grid row node is a group row. |
| \`isRowGroupedBy(record, columnName)\` | Whether the record is a group row of that column. |
| \`isColumnGrouped(column)\` | Whether the rows are grouped by the column. |
| \`canColumnBeGrouped(column)\` | Whether the column's menu offers grouping, \`allowUserGrouping\` included. |
| \`getGroupedCount(record, columnName)\` | How many records a group row holds, while the grouped column's total is \`count\` or \`countcolumn\`. |

| \`aggregation\` member | Description |
|---|---|
| \`addAggregation(columnName, aggregationFunction)\` | Totals the column, replacing the total it had, and calculates the totals again. It takes two arguments and names the alias itself, unlike the provider's \`addAggregation({ columnName, alias, aggregationFunction })\`. |
| \`removeAggregation(alias)\` | Removes a total by its alias, \`<columnName>_<function>\`. |
| \`canColumnBeAggregated(column)\` | Whether the column's menu offers totals, \`allowUserAggregation\` included. |
| \`getTotalLabel(columnName)\` | What the column's total is called, such as *Sum*. |
| \`getAggregateValueColumnName(record, columnName)\` | The alias a group row or the totals row holds the column's total under, for \`record.getValue()\`. |

## Changing how it looks

The grouping module draws an icon in the header of every grouped column and the cell of each group row; the aggregation module draws each column's total in the totals row and in group rows. To change them across the grid, pass \`components\` to the module:

\`\`\`tsx
createGroupingModule({ components: { groupCell: { count: { onRenderCount: props => <Badge {...props} /> } } } })
createAggregationModule({ components: { totalCell: { totalValue: { onRenderValue: props => <strong {...props} /> } } } })
\`\`\`

| Module | Key | Parts | Description |
|---|---|---|---|
| Grouping | \`groupingIcon\` | \`onRenderIcon\` | The icon of a grouped column. |
| Grouping | \`groupCell.toggle\` | \`onRenderContainer\`, \`onRenderButton\` | The chevron that opens and closes a group. |
| Grouping | \`groupCell.count\` | \`onRenderCount\` | How many records the group holds. |
| Grouping | \`groupCell.container\`, \`loading\`, \`control\`, \`columnControl\`, \`commands\` | As in any cell | The rest of the group's cell. |
| Aggregation | \`totalCell.totalValue\` | \`onRenderContainer\`, \`onRenderLabel\`, \`onRenderValue\` | A column's total and its label, in the totals row. |
| Aggregation | \`totalCell.container\`, \`loading\`, \`commands\` | As in any cell | The rest of the total's cell. |
| Aggregation | \`aggregateCell.container\`, \`loading\`, \`control\`, \`columnControl\`, \`commands\` | As in any cell | A column's total in a group row. |

The parts follow the \`components\` rules. See *Replace what the grid draws* on [**Appearance**](?path=/docs/grid-appearance--overview).

{{story: Show group sizes as badges}}

To draw one column's group rows or totals your own way, set its \`cellRendererSelector\` in \`colDefs\` and reuse \`GroupCell\`, \`TotalCell\` or \`AggregateCell\`, whose \`components\` prop is merged over the module's. Your selector replaces the module's for that column: return \`undefined\` for a row to leave it to the column's \`cellRenderer\`, and on a grouped column draw its records empty, as the module does.

\`\`\`tsx
const CategoryGroupCell = (props: IGridCellParams) => <GroupCell {...props} components={GROUP_CELL} />
const StockTotalCell = (props: IGridCellParams) => <TotalCell {...props} components={TOTAL} />

//rows grouped by Category hold its value, and the records under them draw nothing
const isGroupRow = (params: ICellRendererParams<IRecord>) => params.data?.getDataProvider().getSummarizationType() === 'grouping'

colDefs={{
    category: { cellRendererSelector: params => ({ component: isGroupRow(params) ? CategoryGroupCell : Grid.Cell.EmptyRenderer }) },
    instock: { cellRendererSelector: params => params.node.rowPinned ? { component: StockTotalCell } : undefined },
}}
\`\`\`

- The expansion column is keyed \`GROUP_EXPANSION_COLUMN_KEY\`: set its \`headerComponent\` to \`GroupExpansionHeader\`, whose \`expandCollapse\` takes \`onRenderContainer\`, \`onRenderExpandButton\` and \`onRenderCollapseButton\`.
- To change one column's grouping icon, replace the header adornment keyed \`'grouping'\` in \`context.header.onGetAdornments\`.

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
