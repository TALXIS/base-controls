import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { SaveStatusExample } from '../../../grid/examples/customComponentsExamples'
import { FilterIconExample, GroupBadgesExample, SortArrowsExample, StarredProductsExample, StockTotalsExample } from '../../../grid/examples/moduleComponentsExamples'

const DESCRIPTION = `
The modules that draw something take \`components\` for it, or draw it in columns of their own that you replace through \`colDefs\`. Parts follow the rules in *Replacing what the grid draws* on [**Appearance**](?path=/docs/grid-appearance--overview); what each module does is on [**Modules**](?path=/docs/grid-modules--overview).

## Editing

The editing module adds two columns of its own: one a row reports its save in, keyed \`RECORD_SAVE_COLUMN_KEY\`, and one a record locked as a whole shows its lock in, keyed \`RECORD_LOCK_COLUMN_KEY\`. To draw either your own way, set its \`cellRenderer\` in \`colDefs\`, reuse the module's cell and replace its parts through \`components\`.

\`\`\`tsx
const SaveStatusCell = (props: IGridCellParams) => <RecordSaveIndicatorCell {...props} components={SAVE_STATUS} />

<DataProviderContextProvider provider={provider}>
    <Grid
        modules={{ rowModel: createClientSideRowModelModule(), editing: createEditingModule({ autoSave: true }) }}
        colDefs={{ [RECORD_SAVE_COLUMN_KEY]: { cellRenderer: SaveStatusCell } }} />
</DataProviderContextProvider>
\`\`\`

- Every key and part is optional: what you leave out keeps its default.
- A part is called, not mounted, so it can't use hooks itself. Return a component that does.
- Define \`components\` outside your component, so the cell does not redraw on every render.
- With row selection on, the save status is drawn in the checkbox column by \`RecordSaveSelectionCell\`, which also takes \`checkbox\`. Set it on \`SELECTION_COLUMN_KEY\`.

| Cell | Key | Parts | What it draws |
|---|---|---|---|
| \`RecordSaveIndicatorCell\` | \`container\` | \`onRenderContainer\` | The cell the save status is drawn in |
| | \`indicator\` | \`onRenderContainer\`, \`onRenderSpinner\`, \`onRenderButton\`, \`onRenderErrorCallout\` | The status: a spinner while saving, then a button |
| | \`errorCallout\` | \`onRenderCallout\`, \`onRenderHeader\`, \`onRenderIcon\`, \`onRenderTitle\`, \`onRenderFields\`, \`onRenderField\` | The callout a failed save opens |
| \`RecordLockIndicatorCell\` | \`container\` | \`onRenderContainer\` | The cell the lock is drawn in |
| | \`lockIcon\` | \`onRenderTooltip\`, \`onRenderIcon\` | The lock |

{{story: Save status your way}}

## Row selection

The row selection module adds a checkbox column of its own, keyed \`SELECTION_COLUMN_KEY\`: a checkbox in every row, and one in the header that selects every record. To draw them your own way, set the column's \`cellRenderer\` or \`headerComponent\` in \`colDefs\`, reuse the module's cell or header and replace its parts through \`components\`.

\`\`\`tsx
const StarCell = (props: IGridCellParams) => <SelectionCell {...props} components={STAR} />

<DataProviderContextProvider provider={provider}>
    <Grid
        modules={{ rowModel: createClientSideRowModelModule(), rowSelection: createRowSelectionModule({ mode: 'multiple' }) }}
        colDefs={{ [SELECTION_COLUMN_KEY]: { cellRenderer: StarCell } }} />
</DataProviderContextProvider>
\`\`\`

- Every key and part is optional: what you leave out keeps its default.
- A part is called, not mounted, so it can't use hooks itself. Return a component that does.
- Define \`components\` outside your component, so the cell does not redraw on every render.

| Cell | Key | Parts | What it draws |
|---|---|---|---|
| \`SelectionCell\` | \`container\` | \`onRenderContainer\` | The cell the checkbox is drawn in |
| | \`checkbox\` | \`onRenderContainer\`, \`onRenderCheckbox\` | A row's checkbox, handed \`checked\` and \`onChange\` |
| \`SelectionHeader\` | \`headerCheckbox\` | \`onRenderContainer\`, \`onRenderCheckbox\` | The checkbox that selects every record |

{{story: Star products to order}}

## Sorting

The sorting module draws an arrow in the header of every sorted column. To change how it looks across the grid, pass \`components\` to \`createSortingModule\`.

\`\`\`tsx
createSortingModule({ components: { sortIcon: { onRenderIcon: ({ descending, ...props }) => <Icon {...props} /> } } })
\`\`\`

- Every key and part is optional: what you leave out keeps its default.
- A part is called, not mounted, so it can't use hooks itself. Return a component that does.
- Define \`components\` outside your component, so the grid does not redraw on every render.

| Key | Parts | What it draws |
|---|---|---|
| \`sortIcon\` | \`onRenderIcon\` | The arrow of a sorted column, handed \`descending\` |

### One column only

The arrow is a header adornment keyed \`'sort'\`. To change it on one column, replace or remove that adornment in the column's \`context.header.onGetAdornments\`, which runs after the modules have added theirs.

{{story: Arrows of your own}}

## Filtering

The filtering module draws an icon in the header of every filtered column, and the callout a column's filter is set in. To change how they look across the grid, pass \`components\` to \`createFilteringModule\`.

\`\`\`tsx
createFilteringModule({ components: { filterIcon: { onRenderIcon: props => <Icon {...props} iconName='FilterSolid' /> } } })
\`\`\`

- Every key and part is optional: what you leave out keeps its default.
- A part is called, not mounted, so it can't use hooks itself. Return a component that does.
- Define \`components\` outside your component, so the grid does not redraw on every render.

| Key | Parts | What it draws |
|---|---|---|
| \`filterIcon\` | \`onRenderIcon\` | The icon of a filtered column |
| \`filterCallout\` | \`onRenderCallout\`, \`onRenderHeader\`, \`onRenderTitle\`, \`onRenderCloseButton\` | The callout a filter is set in |

### One column only

The funnel is a header adornment keyed \`'filter'\`. To change it on one column, replace or remove that adornment in the column's \`context.header.onGetAdornments\`, which runs after the modules have added theirs. The callout is one for the whole grid, so it has no per-column path.

{{story: A filter that stands out}}

## Grouping

The grouping module draws an icon in the header of every column the rows are grouped by, and the row standing for each group. To change how they look across the grid, pass \`components\` to \`createGroupingModule\`.

\`\`\`tsx
createGroupingModule({ components: { groupCell: { count: { onRenderCount: props => <Badge {...props} /> } } } })
\`\`\`

- Every key and part is optional: what you leave out keeps its default.
- A part is called, not mounted, so it can't use hooks itself. Return a component that does.
- Define \`components\` outside your component, so the grid does not redraw on every render.

| Key | Parts | What it draws |
|---|---|---|
| \`groupingIcon\` | \`onRenderIcon\` | The icon of a column the rows are grouped by |
| \`groupCell.toggle\` | \`onRenderContainer\`, \`onRenderButton\` | The chevron that opens and closes a group |
| \`groupCell.count\` | \`onRenderCount\` | How many records the group holds |
| \`groupCell.container\`, \`loading\`, \`control\`, \`columnControl\`, \`commands\` | As in any cell | The rest of the group's cell |

### One column only

The module picks a group row's cell through the column's \`cellRendererSelector\`, and leaves every other row to its \`cellRenderer\`. To draw one column's group rows your own way, set its \`cellRendererSelector\` in \`colDefs\` and reuse \`GroupCell\`: its \`components\` prop is merged over the module's.

\`\`\`tsx
const CategoryGroupCell = (props: IGridCellParams) => <GroupCell {...props} components={GROUP_CELL} />

//rows grouped by Category hold its value, and the records under them draw nothing
const isGroupRow = (params: ICellRendererParams<IRecord>) => params.data?.getDataProvider().getSummarizationType() === 'grouping'

colDefs={{ category: { cellRendererSelector: params => ({ component: isGroupRow(params) ? CategoryGroupCell : Grid.Cell.EmptyRenderer }) } }}
\`\`\`

Your selector replaces the module's for that column. Return \`undefined\` for a row to leave it to the column's \`cellRenderer\`; on a grouped column, draw its records empty, as the module does. The expansion column is the module's own, keyed \`GROUP_EXPANSION_COLUMN_KEY\`: set its \`headerComponent\` and reuse \`GroupExpansionHeader\`, whose \`expandCollapse\` takes \`onRenderContainer\`, \`onRenderExpandButton\` and \`onRenderCollapseButton\`.

To mark one column's grouping icon, replace the header adornment keyed \`'grouping'\` in \`context.header.onGetAdornments\`.

{{story: Group sizes as badges}}

## Totals

The aggregation module draws each column's total in a row pinned under the rest, and in a group's row. To change how they look across the grid, pass \`components\` to \`createAggregationModule\`.

\`\`\`tsx
createAggregationModule({ components: { totalCell: { totalValue: { onRenderValue: props => <strong {...props} /> } } } })
\`\`\`

- Every key and part is optional: what you leave out keeps its default.
- A part is called, not mounted, so it can't use hooks itself. Return a component that does.
- Define \`components\` outside your component, so the grid does not redraw on every render.

| Key | Parts | What it draws |
|---|---|---|
| \`totalCell.totalValue\` | \`onRenderContainer\`, \`onRenderLabel\`, \`onRenderValue\` | A column's total and what it is, in the pinned row |
| \`totalCell.container\`, \`loading\`, \`commands\` | As in any cell | The rest of the total's cell |
| \`aggregateCell.container\`, \`loading\`, \`control\`, \`columnControl\`, \`commands\` | As in any cell | A column's total in a group's row |

### One column only

The module picks the totals row's and a group's total cell through the column's \`cellRendererSelector\`, and leaves every other row to its \`cellRenderer\`. To draw one column's total your own way, set its \`cellRendererSelector\` in \`colDefs\` and reuse \`TotalCell\` or \`AggregateCell\`: their \`components\` prop is merged over the module's.

\`\`\`tsx
const StockTotalCell = (props: IGridCellParams) => <TotalCell {...props} components={TOTAL} />

colDefs={{ instock: { cellRendererSelector: params => params.node.rowPinned ? { component: StockTotalCell } : undefined } }}
\`\`\`

Your selector replaces the module's for that column: return \`undefined\` for a row to leave it to the column's \`cellRenderer\`.

{{story: Totals that read at a glance}}
`

const meta = {
    title: 'Grid/Appearance/Module parts',
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

export const SaveStatusYourWay: Story = {
    name: 'Save status your way',
    render: () => renderStory(<SaveStatusExample />),
    parameters: {
        docs: {
            description: {
                story: `The save column's \`cellRenderer\` is \`RecordSaveIndicatorCell\` with \`indicator\` and \`errorCallout\` replaced: a labelled button, and the product's name in the failed-save callout. Set a price above 1,000.`,
            },
        },
    },
}

export const StarProductsToOrder: Story = {
    name: 'Star products to order',
    render: () => renderStory(<StarredProductsExample />),
    parameters: {
        docs: {
            description: {
                story: `The checkbox column's \`cellRenderer\` is \`SelectionCell\` with \`checkbox\` replaced by a star: selecting a product stars it. Star a few products.`,
            },
        },
    },
}

export const ArrowsOfYourOwn: Story = {
    name: 'Arrows of your own',
    render: () => renderStory(<SortArrowsExample />),
    parameters: {
        docs: {
            description: {
                story: `\`sortIcon\` draws the arrow as a blue sort glyph that turns with the direction. Price is sorted; sort another column from its menu.`,
            },
        },
    },
}

export const AFilterThatStandsOut: Story = {
    name: 'A filter that stands out',
    render: () => renderStory(<FilterIconExample />),
    parameters: {
        docs: {
            description: {
                story: `\`filterIcon\` marks the filtered In stock column with a solid blue icon, and \`filterCallout.onRenderTitle\` heads the callout with what it filters by. Open the In stock filter from its menu.`,
            },
        },
    },
}

export const GroupSizesAsBadges: Story = {
    name: 'Group sizes as badges',
    render: () => renderStory(<GroupBadgesExample />),
    parameters: {
        docs: {
            description: {
                story: `\`groupCell.count\` draws each category's size as a badge, and \`groupingIcon\` colours the Category header's icon.`,
            },
        },
    },
}

export const TotalsThatReadAtAGlance: Story = {
    name: 'Totals that read at a glance',
    render: () => renderStory(<StockTotalsExample />),
    parameters: {
        docs: {
            description: {
                story: `\`totalCell.totalValue\` draws the label small and uppercase and the value bold and blue. In stock is summed and Price averaged.`,
            },
        },
    },
}
