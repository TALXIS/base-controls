import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { MemoryTaskGrid } from '../../../task-grid/MemoryTaskGrid'

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
| Views | \`enableViewSwitcher\`, \`enableQueryManager\`, \`enableSaveAsNewQuery\`, \`enableSaveQueryChanges\` |
| Columns | \`enableEditColumns\`, \`enableEditColumnsScopeSelector\`, \`enableCustomColumnCreation\`, \`enableCustomColumnEditing\`, \`enableCustomColumnDeletion\` |
| Display | \`enableShowHierarchyToggle\`, \`enableHideInactiveTasksToggle\`, \`enableNavigation\`, \`rowHeight\`, \`agGridLicenseKey\` |

A few interact with each other: \`enableRowDragging\` is suppressed automatically in flat-list mode or when sorting by a non-rank column, and the user-query flags only matter once \`enableViewSwitcher\` is on.

Every flag defaults to \`false\`, so a feature missing from the ribbon is usually one of two things: its flag was left out of \`onGetGridParameters\`, or the optional descriptor hook that enables it returned nothing.

The two are not independent. A flag can only trim commands **within** a feature that exists, because the getters AND the two together — \`isSaveQueryAsNewEnabled()\` is \`isUserQueriesEnabled() && enableSaveAsNewQuery\`, and the custom-column flags work the same way against \`isCustomColumnsEnabled()\`. Whether the feature exists at all is decided by the descriptor: personal views by \`onCreateUserQueryStrategy\`, templates by \`onCreateTemplateDataProvider\`, custom columns by \`onCreateCustomColumnsStrategy\`. Supplying the implementation is the switch — which is also what keeps unused strategies out of your bundle.

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

The lowest level the grid offers: return an \`IGridCustomizerStrategy\` from \`onCreateGridCustomizerStrategy()\` and you hold the AG Grid instance and the records behind it. Anything the grid does is reachable from there — cell renderers included, since a renderer is just \`colDef.cellRenderer\`.

It has its own page, with live examples of validation, conditional formatting and reaching the ag-grid api directly: [**Customizer**](?path=/story/task-grid-customizations-customizer--overview).

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

The grid's cells, its loading skeleton and its command bar can all be swapped for your own components through the \`components\` prop. That has its own page, with a live example: [**Custom Components**](?path=/story/task-grid-customizations-custom-components--overview).
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
