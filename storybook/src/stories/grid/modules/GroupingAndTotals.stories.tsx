import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { ExpandFromRibbonExample, FilteredTotalsExample, HoursByEmployeeExample, PipelineByManagerExample, SubmittedEntriesExample } from '../../../grid/examples/groupingTotalsExamples'
import { GroupBadgesExample, StockTotalsExample } from '../../../grid/examples/moduleComponentsExamples'

const DESCRIPTION = `
Grouping gathers the rows under a group row for each value of a column, level by level, and the aggregation module adds totals to every group row and to a row pinned under the list. Grouping needs AG Grid Enterprise and totals do not (see [**Modules**](?path=/docs/controls-grid-modules--overview)). Try it below: group by *Stage* too from its menu.

{{canvas: Group the pipeline by account manager}}

## What grouping does to the grid

A column offers *Group* and *Ungroup* in its menu when its metadata sets \`CanBeGrouped\` and it is not a multi-select option set. A grouped column shows a group icon before its name, moves to the front, is pinned to the left and cannot be edited; dragging one grouped column ahead of another changes the order of the levels. A narrow column at the far left, \`GROUP_EXPANSION_COLUMN_KEY\`, has a + and a − in its header that open or close one level of groups at a time.

A group row shows its value, a chevron and its record count in the column of its level, and its totals in the columns that have one; every cell of a group row is locked. Record rows take the grid's plain background, so zebra stripes go, and so does a background a cell theme hook below \`GRID_MODULE_PRIORITY.grouping\` sets (see *How hooks run* on [**Hooks**](?path=/docs/controls-grid-extending-hooks--overview)).

## Nested or flat

\`type: 'nested'\`, the default, makes each grouped column a level of its own: a group row stands for one value of its level's column and opens onto the groups of the next level. \`type: 'flat'\` makes one level of groups, one for each combination of values, and every grouped column shows its value on the group row.

{{story: Group hours by employee and day}}

The grid passes \`type\` to the provider when it mounts, and the provider regroups on its next load. To switch, remount the grid with a new \`key\` and refresh the provider, as the example does.

## Opening groups

\`defaultExpandedLevel\` sets how deep the groups open. Levels count from \`0\`, the top one; the default \`-1\` keeps every group closed, and a number past the deepest level opens everything. A group the user opens or closes keeps that state until \`setExpandedLevel\` or the expansion column's buttons apply a level again, and the grid's [**State**](?path=/docs/controls-grid-state--overview) keeps both.

{{story: Expand and collapse from the ribbon}}

Whether the groups' records load with the list or as each group opens depends on the row model: see *Row models* on [**Modules**](?path=/docs/controls-grid-modules--overview).

## Grouping and selection

With row selection on, selecting a group row selects every record in it, so the grid first loads the records of each newly selected group, a level at a time; on the client-side row model they are loaded already. A selection that would load more than \`maxGroupLoadsPerSelection\` groups is refused with an alert, and a group that holds more than 5,000 records loads the first 5,000 and says so. To change their texts, see [**Localization**](?path=/docs/concepts-localization--overview).

## The totals row

The totals row appears while any column has a total and the list has a record, pinned at the bottom. Each column's menu has a *Totals* section with *None* and the functions in its \`metadata.SupportedAggregations\`, unless \`enableUserAggregation\` is \`false\`.

{{story: Total the filtered list}}

The totals cover the whole list as filtered and searched, not just the page on screen. They show saved data: they update on each load and after each save or delete, but not while a value is being edited. The row shimmers while the totals load, and shows the error across its width if that fails. Changing a total while the rows are grouped reloads the rows, which clears the selection.

## Summary rows

Group rows and the totals row are summary rows: records (\`IRecord\`) like any other, and the grid runs everything for them it runs for a record, from every \`context.cell\` callback to the row height, lock, validation and command hooks, legacy client API expressions and events such as \`onRowClicked\`. Tell them apart by \`record.getDataProvider().getSummarizationType()\`:

| \`getSummarizationType()\` | Row |
|---|---|
| \`'none'\` | A record |
| \`'grouping'\` | A group row |
| \`'aggregation'\` | The totals row |

{{story: Lock submitted entries only}}

Summary rows hold their values under aliases, so \`record.getValue('status')\` reads \`null\` on them, and a rule that acts on an empty value acts on them too, as the lock above does without its guard. \`grouping.getGroupedValueColumnName\` and \`aggregation.getAggregateValueColumnName\` return the alias to read.

## Preset grouping and totals

Grouping and totals live on the provider, like the sort and the filter: add them before the provider loads and the grid opens grouped and totalled, as the pipeline at the top of this page does. The calls, and the aliases the values are held under, are under *Groups and totals* on [**Data providers**](?path=/docs/concepts-data-providers--overview).

Call \`setColumns\` first, since grouping and totals are written onto the current columns, and name the aliases as the column menu does: \`<column>_group\` and \`<column>_<function>\`. To ungroup from code, remove each level with \`removeGroupBy\`: \`grouping.clear()\` leaves the columns it ungroups read-only.

## Options

The options are *At mount*: see *Change a prop that is read at mount* on [**Props and events**](?path=/docs/controls-grid-props-and-events--overview).

| \`createGroupingModule\` option | Type | Default | Description |
|---|---|---|---|
| \`enableUserGrouping\` | \`boolean\` | \`true\` | Whether column menus offer *Group* and *Ungroup*. Preset grouping and \`toggleColumnGroup\` work either way. |
| \`type\` | \`'nested' \\| 'flat'\` | \`'nested'\` | See *Nested or flat*. |
| \`defaultExpandedLevel\` | \`number\` | \`-1\` | The deepest level that opens by itself. |
| \`pinGroupedColumns\` | \`boolean\` | \`true\` | Pins grouped columns to the left. They move to the front either way. |
| \`maxGroupLoadsPerSelection\` | \`number\` | \`100\` | How many groups one selection may load. See *Grouping and selection*. |
| \`components\` | \`IGridGroupingComponents\` | \`{}\` | See *Changing how it looks*. |

| \`createAggregationModule\` option | Type | Default | Description |
|---|---|---|---|
| \`enableUserAggregation\` | \`boolean\` | \`true\` | Whether column menus have a *Totals* section. Preset totals show either way. |
| \`components\` | \`IGridAggregationComponents\` | \`{}\` | See *Changing how it looks*. |

To change the menu texts, tooltips and totals' names, see [**Localization**](?path=/docs/concepts-localization--overview).

## Changing how it looks

Both modules take \`components\` (see *Options*). How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Module | Key | Slots | Default | Draws |
|---|---|---|---|---|
| Grouping | \`groupingIcon\` | \`onRenderIcon\` | \`GridGroupingIconComponents\` | The icon of a grouped column |
| | \`groupCell.toggle\` | \`onRenderContainer\`, \`onRenderButton\` (with \`isExpanded\`) | \`GroupingUiToggleComponents\` | The chevron of a group |
| | \`groupCell.count\` | \`onRenderCount\` | \`GroupingUiCountComponents\` | How many records the group holds |
| | \`groupCell.container\`, \`loading\`, \`control\`, \`columnControl\`, \`commands\` | As in any cell (see [**Custom cells**](?path=/docs/controls-grid-appearance-custom-cells--overview)) | | The rest of a group's cell |
| Aggregation | \`totalCell.totalValue\` | \`onRenderContainer\`, \`onRenderLabel\`, \`onRenderValue\` | \`AggregationUiTotalValueComponents\` | A total and its label in the totals row |
| | \`totalCell.container\`, \`loading\`, \`commands\` | As in any cell | | The rest of a total's cell |
| | \`aggregateCell.container\`, \`loading\`, \`control\`, \`columnControl\`, \`commands\` | As in any cell | | A total in a group row |

{{story: Show group sizes as badges}}

The cells are \`GroupCell\`, \`TotalCell\` and \`AggregateCell\`, and a key in their own \`components\` prop replaces the module's for that key. To draw one column's group rows or totals your own way, set its \`cellRendererSelector\` on its definition, as the totals example below does. It replaces the module's for that column, so return \`undefined\` for the rows it should leave to \`cellRenderer\`, and draw a grouped column's records empty.

The expansion column's header is \`GroupExpansionHeader\`: pass \`headerComponentParams: { components: { expandCollapse } }\` on \`GROUP_EXPANSION_COLUMN_KEY\`, with the slots \`onRenderContainer\`, \`onRenderExpandButton\` and \`onRenderCollapseButton\` (default \`GroupingUiExpandCollapseComponents\`). To change one column's grouping icon, replace the header adornment keyed \`'grouping'\` in its \`context.header.adornmentsHook\`. The alert for a refused selection is the host's own dialog and has no slots.

{{story: Make totals read at a glance}}

## Reference

### Members

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
| \`isColumnGrouped(column)\`, \`canGroupColumn(column)\` | Whether the rows are grouped by the column, and whether its menu offers grouping. |
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
| \`canAggregateColumn(column)\` | Whether the column's menu offers totals. |
| \`getTotalLabel(columnName)\` | What the column's total is called, such as *Sum*. |
| \`getAggregateValueColumnName(record, columnName)\` | The alias a group row or the totals row holds the column's total under. |
| \`components\` | The \`components\` the module was given. |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Selection and clipboard', iconName: 'MultiSelect', href: '?path=/docs/controls-grid-modules-selection-and-clipboard--overview', text: 'Select whole groups of records, and copy them out.' },
    { title: 'Data providers', iconName: 'Database', href: '?path=/docs/concepts-data-providers--overview', text: 'Group and total the records on the provider, with aliases.' },
    { title: 'Modules', iconName: 'Puzzle', href: '?path=/docs/controls-grid-modules--overview', text: 'Pick the row model that loads a group\'s records as it opens.' },
]

const meta = {
    title: 'Controls/Grid/Modules/Grouping and totals',
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

export const PipelineByAccountManager: Story = {
    name: 'Group the pipeline by account manager',
    render: () => renderStory(<PipelineByManagerExample />),
}

export const HoursByEmployeeAndDay: Story = {
    name: 'Group hours by employee and day',
    render: () => renderStory(<HoursByEmployeeExample />),
    parameters: {
        docs: {
            description: {
                story: `Last week's hours per person and per day, with *Hours* summed on every group row. Try: pick *One group per employee and day*.`,
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
                story: `Timesheets by status, then by employee, with a ribbon that calls \`grouping.setExpandedLevel\`. Try: press *Expand one level*.`,
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
                story: `The provider counts the deals and sums *Value* over whatever the pipeline is filtered to. Try: filter *Stage* to Negotiate.`,
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
                story: `\`totalCell.totalValue\` restyles every total, and a \`cellRendererSelector\` gives *In stock* a \`TotalCell\` of its own. Try: pick another total from a column's menu.`,
            },
        },
    },
}

export const LockSubmittedEntriesOnly: Story = {
    name: 'Lock submitted entries only',
    render: () => renderStory(<SubmittedEntriesExample />),
    parameters: {
        docs: {
            description: {
                story: `A lock hook locks every entry past *Draft* or *Rejected*, and skips summary rows by \`getSummarizationType()\`. Try: turn off *Skip summary rows*.`,
            },
        },
    },
}
