import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { CzechLabelsExample } from '../../grid/examples/appearanceExamples'

const DESCRIPTION = `
Every string the grid shows can be replaced: the grid's own through \`labels\`, each module's through its options, and column and option names through the provider.

\`\`\`tsx
<DatasetControl onLoad={loadTimesheets}>
    <DatasetControl.Body>
        <Grid
            labels={{ noRecordsFound: 'Žádné záznamy.' }}
            modules={[createClientSideRowModelModule(), createSortingModule({ labels: { clear: 'Zrušit' } })]} />
    </DatasetControl.Body>
</DatasetControl>
\`\`\`

{{story: Translate the grid}}

## The grid's labels

\`labels\` on \`<Grid />\` takes any of these keys; the rest keep their English default, held in \`GRID_LABELS\`. It is read at mount: see *Change a prop that is read at mount* on [**Props and events**](?path=/docs/grid-props-and-events--overview).

| Key | Default | Description |
|---|---|---|
| \`noRecordsFound\` | No records found. | The overlay of a grid with no rows |
| \`valueLocked\` | This value cannot be edited. | The tooltip of a cell's lock icon, for a single locked value |
| \`recordLocked\` | This record cannot be edited. | The tooltip of the lock at the start of a row locked as a whole |
| \`columnLocked\` | This column cannot be edited. | The tooltip of the lock in a locked column's header |
| \`recordSaveErrorTitle\` | Your changes were not saved | The title of the callout that a failed save's icon opens |
| \`recordSaveErrorDismiss\` | Dismiss | The button in that callout that clears the failure |

Which lock shows where is on [**Editing**](?path=/docs/grid-modules-editing--overview).

## Module labels

Each module that draws text takes \`labels\` of its own, such as \`createSortingModule({ labels })\`, read at mount. The grid's \`labels\` prop does not cover them. Keep the \`{{...}}\` placeholders in a translation.

| Sorting key | Default | Description |
|---|---|---|
| \`sortTextAscending\`, \`sortTextDescending\` | Sort A to Z, Sort Z to A | The sort items of text, option set, lookup and any column not listed below |
| \`sortDateAscending\`, \`sortDateDescending\` | Sort older to newer, Sort newer to older | Date and date-and-time columns |
| \`sortNumberAscending\`, \`sortNumberDescending\` | Sort smaller to larger, Sort larger to smaller | Whole number, decimal, duration and currency columns |
| \`sortTwoOptionsJoint\` | to | Between a yes/no column's two labels: *No to Yes* |
| \`clear\` | Clear | The item that takes the column out of the sort |
| \`menuSection\` | Sorting | The section's heading |

| Filtering key | Default | Description |
|---|---|---|
| \`filterMenuFilterBy\` | Filter By | The menu item, and the callout's title |
| \`clear\` | Clear | The menu item that removes the column's filter |
| \`menuSection\` | Filtering | The section's heading |

| Grouping key | Default | Description |
|---|---|---|
| \`group\`, \`ungroup\` | Group, Ungroup | The column menu item |
| \`menuSection\` | Grouping | The section's heading |
| \`headerTitle\` | Group | Added to a grouped column's header tooltip |
| \`expandLevel\`, \`collapseLevel\` | Expand one level, Collapse one level | The tooltips of the expansion column's + and − |
| \`maximumGroupChildrenLimitReached\` | The maximum limit of {{maxGroupChildren}} child records has been reached. Records above this limit will not be loaded. | The error shown once per load when a group holds more records than its provider loads |
| \`groupSelectionLimitMessage\` | This selection would load the records of more than {{maxGroupLoads}} groups. Select fewer groups, or expand them and select their records. | The alert that refuses a selection over \`maxGroupLoadsPerSelection\` |
| \`groupSelectionLimitConfirm\` | OK | That alert's button |

| Aggregation key | Default | Description |
|---|---|---|
| \`totalNone\` | None | The menu item that removes the column's total |
| \`totalSum\`, \`totalAverage\` | Sum, Average | \`sum\`, \`avg\` |
| \`totalMinimum\`, \`totalMaximum\` | Minimum, Maximum | \`min\`, \`max\` |
| \`totalCount\` | Count (including empty values) | \`count\` |
| \`totalCountColumn\` | Count | \`countcolumn\` |
| \`menuSection\` | Totals | The section's heading |

A function's label is its menu item, the caption above the figure in the totals row, and part of the column's header tooltip.

Inside the filter callout, the operator names follow the user's language, and the *Apply* and *Clear* buttons are always in English.

## Column names, options and values

They come from the provider: each column's \`displayName\`, the labels in \`metadata.OptionSet\`, and the values it formats. See [**Data**](?path=/docs/grid-data--overview).
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

export const SpeakYourUsersLanguage: Story = {
    name: 'Translate the grid',
    render: () => renderStory(<CzechLabelsExample />),
    parameters: {
        docs: {
            description: {
                story: `A Czech consultancy's timesheets, from a provider that names its columns and options in Czech, with \`labels\` on the grid and on each module. Try: open a column's menu, or hover the lock in the *Zaměstnanec* header or at the start of an approved entry (grouping is AG Grid Enterprise).`,
            },
        },
    },
}
