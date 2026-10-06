import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { CzechLabelsExample } from '../../grid/examples/appearanceExamples'

const DESCRIPTION = `
Every string the grid shows can be replaced: the grid's own through \`labels\`, each module's through its options, and column and option names through the provider.

{{story: Speak your users' language}}

## The grid's labels

\`labels\` on \`<Grid.Root />\` takes any of these keys; the rest keep their English default. It is read once, at mount. \`GRID_LABELS\` holds the defaults.

| Key | Default | Where it shows |
|---|---|---|
| \`noRecordsFound\` | No records found. | The overlay of a grid with no rows |
| \`valueLocked\` | This value cannot be edited. | The tooltip of a cell's lock icon, for a single locked value |
| \`recordLocked\` | This record cannot be edited. | The tooltip of the lock at the start of a row locked as a whole |
| \`columnLocked\` | This column cannot be edited. | The tooltip of the lock in a locked column's header |
| \`recordSaveErrorTitle\` | Your changes were not saved | The title of the callout that a failed save's icon opens |
| \`recordSaveErrorDismiss\` | Dismiss | The button in that callout that clears the failure |

Which lock shows where is on [**Editing**](?path=/docs/grid-modules-editing--overview).

## Module labels and the rest

The grid's \`labels\` cover only the strings above. Each module that draws text takes \`labels\` of its own, and the provider supplies the rest.

| What | Where its strings go | Keys and defaults |
|---|---|---|
| The grid | \`labels\` on \`<Grid.Root />\` | Above |
| Sorting | \`createSortingModule({ labels })\` | [**Sorting and filtering**](?path=/docs/grid-modules-sorting-and-filtering--overview) |
| Filtering | \`createFilteringModule({ labels })\` | [**Sorting and filtering**](?path=/docs/grid-modules-sorting-and-filtering--overview) |
| Grouping | \`createGroupingModule({ labels })\` | [**Grouping and totals**](?path=/docs/grid-modules-grouping-and-totals--overview) |
| Totals | \`createAggregationModule({ labels })\` | [**Grouping and totals**](?path=/docs/grid-modules-grouping-and-totals--overview) |
| Column names, option names and values | The provider: each column's \`displayName\`, the labels in \`metadata.OptionSet\`, and its formatted values | [**Data**](?path=/docs/grid-get-started-data--overview) |
`

const meta = {
    title: 'Grid/Localization/Overview',
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

export const SpeakYourUsersLanguage: Story = {
    name: "Speak your users' language",
    render: () => renderStory(<CzechLabelsExample />),
    parameters: {
        docs: {
            description: {
                story: `A Czech consultancy's timesheets, from a provider that names its columns and options in Czech: \`labels\` translates the grid's own strings, and the sorting, filtering, grouping and aggregation modules each take \`labels\` of their own. Open a column's menu, or hover the lock in the *Zaměstnanec* header or at the start of an approved entry (grouping is AG Grid Enterprise).`,
            },
        },
    },
}
