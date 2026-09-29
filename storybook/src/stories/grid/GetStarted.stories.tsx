import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { OverviewExample } from '../../grid/examples/getStartedExamples'
import { docsPageWithExample } from '../docsPageWithExample'

const DESCRIPTION = `
Grid is the data grid the dataset controls are built on. It draws the records of a data provider with the right control for each column's data type, lets users edit them, and grows with modules: sorting, filtering, grouping, totals, selection and more. It is built on <a href="https://www.ag-grid.com/" target="_blank">AG Grid</a>.

The grid below is real. Flip **Code** to see what renders it, and edit it: the preview follows.

## What you get

- A cell for every data type a provider knows (text, numbers, currency, dates, option sets, lookups, files), drawn and edited with the platform's own controls.
- Editing with validation, required values and saving, switched on with one prop.
- Modules for sorting, filtering, grouping, totals, row and cell selection, and copying. A grid has the ones you give it.
- Replaceable UI: cells, headers, overlays and loading rows can be drawn by your own components.
- Hooks that change what the grid does per record or per column, and modules of your own on top.

## Render it

\`\`\`tsx
import { Grid, createClientSideRowModelModule, createSortingModule } from '@talxis/base-controls'

<Grid.Root
    provider={provider}
    modules={{
        rowModel: createClientSideRowModelModule(),
        sorting: createSortingModule(),
    }}
    height='440px' />
\`\`\`

- \`provider\` is any data provider from \`@talxis/client-libraries\`, such as \`MemoryDataProvider\`. What the grid reads from it is on [**Data**](?path=/story/grid-data--overview).
- \`modules.rowModel\` is the one module every grid needs. The rest are on [**Modules**](?path=/story/grid-modules--overview).
- The grid reads the PCF context and the theme from \`PcfContextProvider\`, so render it inside one.

### \`<Grid.Root />\` props

| Prop | Required | Default | Description |
|---|---|---|---|
| \`provider\` | ✅ | | Where the records and columns come from. Read at mount. |
| \`modules\` | ✅ | | The features the grid has. Read at mount. See [**Modules**](?path=/story/grid-modules--overview). |
| \`height\` | — | grows with its rows | How tall the grid is, as a CSS length. |
| \`maxVisibleRows\` | — | \`15\` | How many rows a grid without a \`height\` grows to before it scrolls. |
| \`enableEditing\` | — | \`false\` | Whether users can edit cells. Read at mount. |
| \`enableAutoSave\` | — | \`false\` | Whether a record saves as soon as a value in it changes. |
| \`enableNavigation\` | — | \`true\` | Whether a double click on a row opens its record. Read at mount. |
| \`enableZebra\` | — | \`true\` | Whether every other row is shaded. Read at mount. |
| \`enableOptionSetColors\` | — | \`false\` | Whether an option set's editor shows its options in their colours. Read at mount. |
| \`rowHeight\` | — | \`42\` | How tall a row is, in pixels. Read at mount. |
| \`colDefs\` | — | | Changes to columns, and columns of your own. Read at mount. See [**Columns**](?path=/story/grid-customizations-columns--overview). |
| \`components\` | — | | Your own overlays and loading rows. See [**Custom Components**](?path=/story/grid-customizations-custom-components--overview). |
| \`labels\` | — | | Your own strings. Read at mount. See [**Customizations**](?path=/story/grid-customizations--overview). |
| \`state\` | — | | AG Grid state to open with: column order, widths and sorting. Read at mount. |
| \`className\` | — | | Added to the grid's own element. |
| \`onGridReady\` | — | | Called with the grid's runtime once it is ready. See [**Extending**](?path=/story/grid-extending--overview). |
| \`onDestroyed\` | — | | Called with the grid's runtime as the grid is torn down. |

A prop read at mount keeps the value it had when the grid first rendered. To change one, render the grid again with a new \`key\`, as the examples on these pages do when a toggle changes a module.

## Reacting to the grid

These events are props on \`<Grid.Root />\`. A module's own events are options of that module, such as \`onSelectionChanged\` of row selection on [**Modules**](?path=/story/grid-modules--overview).

| Prop | Called with | When |
|---|---|---|
| \`onDataLoaded\` | | New data is in the grid. |
| \`onLoadingChanged\` | \`isLoading\` | The grid starts or stops loading. |
| \`onRowClicked\` | \`record\` | A row is clicked. |
| \`onCellDoubleClicked\` | \`record\`, \`columnName\` | A cell is double-clicked. |
| \`onFocusedCellChanged\` | \`record\`, \`columnName\` | The focus moves to another cell; both are \`undefined\` when it leaves the rows. |
| \`onEditedCellChanged\` | \`{ recordId, columnName }\` or \`undefined\` | An editor opens or closes. |
| \`onRecordValueChanged\` | \`record\`, \`columnName\`, \`newValue\` | A value in a record changes. |
| \`onBeforeRecordSaved\` | \`record\` | A record starts saving. |
| \`onAfterRecordSaved\` | \`{ recordId, success, fields }\` | A record has finished saving. |
| \`onColumnsChanged\` | \`columns\` | The user resizes or moves a column. \`columns\` are the provider's columns afterwards. |
| \`onError\` | \`message\`, \`details\` | The provider reports an error. |

## Where to go next

- [**Data**](?path=/story/grid-data--overview): what a provider needs to say about its columns.
- [**Modules**](?path=/story/grid-modules--overview): row models, selection, sorting, filtering, grouping and totals.
- [**Customizations**](?path=/story/grid-customizations--overview): the feature props and labels. [**Columns**](?path=/story/grid-customizations-columns--overview) and [**Custom Components**](?path=/story/grid-customizations-custom-components--overview) sit under it.
- [**Extending**](?path=/story/grid-extending--overview): hooks, modules of your own, and AG Grid itself.
`

const meta = {
    title: 'Grid/Get started',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: docsPageWithExample(DESCRIPTION),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Overview: Story = {
    name: 'Overview',
    render: () => renderStory(<OverviewExample />),
}
