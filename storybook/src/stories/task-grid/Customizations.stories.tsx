import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { MemoryTaskGrid } from '../../task-grid/MemoryTaskGrid'

const meta = {
    title: 'Task Grid/Customizations',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            story: {
                inline: true,
            },
            canvas: {
                sourceState: 'none',
                additionalActions: [],
            },
            description: {
                component: `
The grid is customized at four levels, in rough order of how often you will reach for them: **feature flags**, **column metadata**, **the grid customizer**, and **replaceable UI**.

Everything on this page is independent of which strategy you use.

## Feature flags

\`onGetGridParameters()\` returns \`ITaskGridParameters\`. Every flag defaults to \`false\`, so the grid starts minimal and you opt into what you want.

\`\`\`ts
public onGetGridParameters(): ITaskGridParameters {
    return {
        enableTaskEditing: true,
        enableTaskCreation: true,
        enableInlineCreation: true,
        enableRowDragging: true,
        enableQuickFind: true,
        enableViewSwitcher: true,
    }
}
\`\`\`

Grouped by what they control:

| Area | Flags |
|---|---|
| Editing | \`enableTaskEditing\`, \`enableTaskCreation\`, \`enableInlineCreation\`, \`enableTaskDeletion\` |
| Ordering | \`enableRowDragging\`, \`enableSorting\`, \`enableFiltering\` |
| Views | \`enableViewSwitcher\`, \`enableUserQueries\`, \`enableQueryManager\`, \`enableSaveAsNewQuery\`, \`enableSaveQueryChanges\` |
| Columns | \`enableEditColumns\`, \`enableEditColumnsScopeSelector\`, \`enableCustomColumnCreation\`, \`enableCustomColumnEditing\`, \`enableCustomColumnDeletion\` |
| Display | \`enableShowHierarchyToggle\`, \`enableHideInactiveTasksToggle\`, \`enableNavigation\`, \`rowHeight\`, \`agGridLicenseKey\` |

A few interact with each other: \`enableRowDragging\` is suppressed automatically in flat-list mode or when sorting by a non-rank column, and the user-query flags only matter once \`enableViewSwitcher\` is on.

## Column metadata

Most per-column behaviour comes from the column definitions your strategy returns, not from code. A column's \`controls\` entry selects a built-in renderer by name:

| Control name | Applied as | Notes |
|---|---|---|
| \`PercentComplete\` | renderer + editor | Progress bar with an inline percentage editor. |
| \`LookupMany\` | renderer | Generic multi-record picker. |
| \`PeopleLookupMany\` | renderer | Avatar picker. Takes an \`ImageUrlPropertyName\` binding. |
| \`ColorfulLookupMany\` | renderer | Coloured chips. Takes a \`ColorPropertyName\` binding. |

\`\`\`ts
{
    name: 'percentcomplete',
    dataType: 'Whole.None',
    displayName: '% Complete',
    controls: [{ appliesTo: 'both', name: 'PercentComplete' }],
}
\`\`\`

Lookup-many columns are registered automatically whenever \`metadata.LookupMany\` is set — no customizer needed. The candidates come from the descriptor's \`onCreateLookupManyDataProvider\`, which each strategy implements its own way. Both are visible in the grid below on the **Assigned To** and **Tags** columns.

## The grid customizer

For anything the metadata cannot express, return an \`IGridCustomizerStrategy\` from \`onCreateGridCustomizerStrategy()\`. This is direct access to the AG Grid column definitions.

| Method | Description |
|---|---|
| \`onInitialize(customizer)\` | Called once when the grid is ready. Keep the reference; subscribe to provider events here. |
| \`onGetColumnDefinitions?(colDefs)\` | Receives the computed \`ColDef[]\`. Return a modified array. |
| \`onGetRowClassRules?(rules)\` | Receives the default row class rules. Extend and return. |

\`\`\`ts
class MyCustomizer implements IGridCustomizerStrategy {
    public onInitialize(customizer: IGridCustomizer) {
        this._customizer = customizer
    }

    public onGetColumnDefinitions(colDefs: ColDef[]): ColDef[] {
        for (const colDef of colDefs) {
            if (colDef.colId === 'priority') {
                colDef.cellRenderer = PriorityCellRenderer
            }
        }
        return colDefs
    }
}
\`\`\`

The customizer runs **after** the grid's own column setup, so you can override native decisions — including the lookup-many renderer, if you want a different one.

\`IGridCustomizer\` gives you:

| Method | Description |
|---|---|
| \`getGridApi()\` | The raw AG Grid \`GridApi\`. |
| \`getTaskDataProvider()\` | The \`ITaskDataProvider\` — record tree, raw record fetches, provider events. |
| \`getDatasetControl()\` | The runtime control interface. |
| \`registerExpressionDecorator(columnName, fn)\` | Runs \`fn\` only if that column is in the current view. Safe to call unconditionally. |

### Custom cell renderers

A renderer is a React component assigned to \`colDef.cellRenderer\`, typed with \`ICellProps\`. Read the record from \`props.record\` and the value through the column id:

\`\`\`tsx
const PriorityCellRenderer = (props: ICellProps) => {
    const value = props.record.getValue(props.colDef!.colId!)
    return <span>{String(value)}</span>
}
\`\`\`

### Conditional formatting

\`registerExpressionDecorator\` is the safe way to style cells, because a saved view may not contain the column you are targeting:

\`\`\`ts
provider.addEventListener('onRecordLoaded', record => {
    customizer.registerExpressionDecorator('scheduledend', () => {
        record.expressions.ui.setCustomFormattingExpression('scheduledend', theme => {
            const value = record.getValue('scheduledend')
            if (!record.isActive() || !value) return undefined
            return new Date(value as string) < new Date()
                ? { backgroundColor: theme.semanticColors.errorBackground }
                : undefined
        })
    })
})
\`\`\`

## Labels and localization

Pass a \`labels\` prop to override any subset of the UI strings. Some support Liquid-style interpolation:

\`\`\`tsx
<TaskGrid
    pcfContext={pcfContext}
    taskGridDescriptor={descriptor}
    labels={{
        new: 'Add Task',
        deleteSelected: 'Remove',
        'reorderingTaskDialog.text.above': 'Move "{{ baseRecord }}" above "{{ overBaseRecord }}"?',
    }}
/>
\`\`\`

Any key you omit keeps its English default. The full set — around 150 keys — is \`ITaskGridLabels\`.

## Replaceable UI

Two pieces of chrome can be swapped through the \`components\` prop:

\`\`\`tsx
<TaskGrid
    pcfContext={pcfContext}
    taskGridDescriptor={descriptor}
    components={{
        onRenderSkeleton: (props) => <MySpinner height={props.height} />,
        onRenderCommandBar: (props) => <MyCommandBar {...props} />,
    }}
/>
\`\`\`

> Prefer Fluent UI in replacements. The rest of the grid renders with Fluent, so mixing in another design system tends to read as inconsistent rather than intentional.
                `.trim(),
            },
        },
    },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
    name: 'Overview',
    render: () => renderStory(<MemoryTaskGrid />),
}
