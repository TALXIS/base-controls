import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { LabelsExample } from '../../../task-grid/LabelsExample'

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
This page is about tuning a grid whose features you have already chosen: **feature flags**, **column metadata**, **labels**, and **replaceable UI**. All four are independent of which strategy you use.

*Which* features exist at all is a separate axis, and it belongs to [**Modules**](?path=/story/task-grid-modules--overview). The short version: a flag decides whether a feature's UI is shown, a module decides whether the feature exists, and both have to be in place.

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
| Views | \`enableViewSwitcher\` — the personal-view commands are options on the user-queries module instead, see below |
| Columns | \`enableEditColumns\`, \`enableEditColumnsScopeSelector\` |
| Display | \`enableShowHierarchyToggle\`, \`enableHideInactiveTasksToggle\`, \`enableNavigation\`, \`rowHeight\`, \`agGridLicenseKey\` |

A few interact with each other: \`enableRowDragging\` is suppressed automatically in flat-list mode or when sorting by a non-rank column, and the personal-view commands only appear once \`enableViewSwitcher\` is on.

Every flag defaults to \`false\`, so a feature missing from the ribbon is one of two things: its flag was left out of \`onGetGridParameters\`, or the module that provides it was never registered.

Three \`enable*\` options are deliberately **not** on this list — \`enableQueryManager\`, \`enableSaveAsNewQuery\`, \`enableSaveQueryChanges\`. They live on \`createUserQueryModule\`, because the commands they gate arrive with that module. See [**Modules**](?path=/story/task-grid-modules--overview).

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

A column renders as a picker whenever \`metadata.LookupMany\` is set **and** the \`lookupMany\` module is registered — no customizer needed. Each extension ships a factory for the candidates: \`MemoryLookupManyDataProviderFactory\` from records you hold, \`DataverseLookupManyDataProviderFactory\` from the column's own \`FetchXml\` binding. Both columns are live in the grid below — **Assigned To** and **Tags**. Registering the module: [**Modules → lookupMany**](?path=/story/task-grid-modules--overview).

### Making a column filterable

A column offers a filter menu when its \`metadata.SupportedFilterConditionOperators\` is non-empty; leave it out and the menu is hidden for that column. Sorting and quick find are unaffected either way.

\`\`\`ts
metadata: {
    LookupMany: true,
    SupportedFilterConditionOperators: Operators.GetOperatorsForDataType(DataTypes.MultiSelectOptionSet).map(op => op.Value),
}
\`\`\`

Declare it when the values point at something the grid can actually filter on. \`DataverseTaskStrategy\` injects the operators for every \`LookupMany\` column itself, because there the binding is a given; for lookups that are not bound to an entity, declare nothing rather than offering a filter that matches nothing.

## Going lower

When metadata is not enough, the \`gridCustomizer\` module hands you the AG Grid instance itself — column definitions, row class rules, formatting expressions, the api. It has its own page, with live examples: [**Modules → Customizer**](?path=/story/task-grid-modules-customizer--overview).

## Labels and localization

Pass a \`labels\` prop to override any subset of the UI strings. Some support Liquid-style interpolation:

\`\`\`tsx
<TaskGrid
    descriptor={descriptor}
    labels={{
        new: 'Add Task',
        deleteSelected: 'Remove',
        'reorderingTaskDialog.text.above': 'Move "{{ baseRecord }}" above "{{ overBaseRecord }}"?',
    }}
/>
\`\`\`

Any key you omit keeps its English default. \`ITaskGridLabels\` is the full set.

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
    render: () => renderStory(<LabelsExample />),
}
