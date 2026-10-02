import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { BrandThemeExample, CzechLabelsExample, DensityExample, EscalatedTicketsExample, HeaderColoursExample, SpotBreachesExample } from '../../../grid/examples/appearanceExamples'

const DESCRIPTION = `
The grid draws in your theme. On top of it you can colour cells and headers by what they hold, pick a density, switch zebra rows and option set colours, and put every string the grid shows into your users' language. To replace what the grid draws rather than recolour it, see [**Custom Components**](?path=/docs/grid-appearance-custom-components--overview).

## Colour cells by their data

A column colours its own cells with \`settings.cell.onGetTheme(theme, { record })\`. To colour cells across columns, such as a whole row, register a theme hook in a module with \`runtime.services.get('cells').registerCellThemeHook(hook, priority)\`. Both are handed the same \`theme\` builder.

{{story: Spot tickets about to breach}}

{{story: Tint escalated tickets}}

### How a cell theme works

\`theme.colors\` holds three colours: \`primary\`, \`background\` and \`text\`. Change any of them and the grid generates the cell's whole Fluent palette from the three, so the value, its links and tags, the editor and its inputs all follow.

- Set \`text\` whenever you set \`background\`: the text colour is not worked out for you. \`getTextColorForBackground(background)\` returns one that reads on it, a darker shade of a light background or white on a dark one.
- Colours must be strings Fluent can parse: hex, \`rgb()\`, \`hsl()\` or a colour name. CSS variables do not work.
- Every distinct trio of colours generates a full theme, and the result is cached. Keep the palette small, a few fixed colours rather than a shade per value.
- \`theme.edit(key, edit)\` changes the generated theme itself, for example its fonts. Its result is cached under \`key\` for every cell, so the key must name everything the edit depends on.
- Theme hooks and \`onGetTheme\` run for group rows and the totals row too: see *Group rows and the totals row are records too* on [**Grouping and totals**](?path=/docs/grid-modules-grouping-and-totals--overview).
- A cell works out its theme each time it draws, and it draws again when its record changes. A theme that reads anything else, such as a toggle of your own or the clock, needs \`runtime.services.get('cells').render()\` after that changes: see *Redrawing* on [**Extending**](?path=/docs/grid-extending--overview).

### The order theme decisions run in

Each cell starts from the grid's theme, and everything below gets its say in this order. The last one to set a colour wins.

| Step | What | What it sets |
|---|---|---|
| 1 | The row: with \`enableZebra\` on, every other row takes \`palette.neutralLighterAlt\` | \`background\` |
| 2 | \`registerCellThemeHook\` hooks, by ascending priority. The default priority is \`0\`. | Anything |
| | the legacy client API module, at \`GRID_MODULE_PRIORITY.legacyClientApiCompatibility\` (0), ahead of your hooks at \`0\`: the colours of \`ui.setCustomFormattingExpression\` | \`primary\`, \`background\`, \`text\` |
| | the grouping module, at \`GRID_MODULE_PRIORITY.grouping\` (60), while the rows are grouped: record rows go back to the plain background, group rows are shaded and bold | \`background\` |
| | the aggregation module, at \`GRID_MODULE_PRIORITY.aggregation\` (70): the totals row is shaded and bold | \`background\` |
| 3 | The column's \`settings.cell.onGetTheme\` | Anything |

A hook at the default priority therefore loses its background while the rows are grouped. Register it at \`GRID_MODULE_PRIORITY.grouping + 1\`, or at \`GRID_MODULE_PRIORITY.aggregation + 1\` to colour the totals row as well, or colour the column with \`onGetTheme\`, which always has the last word. A cell renderer can also start a column from a theme of its own: see [**Custom Components**](?path=/docs/grid-appearance-custom-components--overview).

## Colour column headers

A column colours its header with \`settings.header.onGetTheme(theme)\`, which takes the same \`theme\` builder. It runs after the hooks registered with \`runtime.services.get('columns').headers.registerColumnHeaderThemeHook(hook, priority)\`, which colour every header.

{{story: Colour-coded column headers}}

- A header starts from the grid's theme, with no zebra, and everything in it is drawn in the result: the name, the required marker, the lock and the module icons. The menu it opens keeps the grid's theme.
- Headers draw again whenever the provider loads. A header theme that reads anything else needs \`runtime.services.get('columns').headers.render()\` after it changes.

## Density, zebra rows and option set colours

{{story: Compact or comfortable}}

| Prop | Default | What it does |
|---|---|---|
| \`rowHeight\` | \`42\` | The height of every row, in pixels. Sizing the grid around it is on [**Props and events**](?path=/docs/grid-get-started-props-and-events--overview). |
| \`enableZebra\` | \`true\` | Shades every other row. A theme that sets \`background\` draws over the shading, and grouping removes it while the rows are grouped. |
| \`enableOptionSetColors\` | \`false\` | Draws option set, multi-select and two-options values as tags in the \`Color\` each option has in \`metadata.OptionSet\`. A value whose option has no colour stays text. The filter callout's value controls follow it too. |

All three are read once, at mount. To change one, give the grid a new \`key\`.

## Your theme, light or dark

The grid takes Fluent's theme from the nearest \`ThemeProvider\`, or Fluent's default theme when there is none. \`ThemeGenerator.generate({ primary, background, text })\` builds a complete theme from three colours, the same way the grid builds a cell's theme.

{{story: Your brand, light or dark}}

- \`ThemeProvider\` from \`@talxis/base-controls\` takes the whole \`theme\` it draws in, an optional \`surfaceTheme\` for callouts, menus and tooltips opened inside it, and \`applyTo\`: \`'element'\` (the default) paints its own element in the theme, \`'none'\` does not.
- The grid reads the theme once, at mount. Its borders and background follow a new theme, but cells, headers, group rows and the totals row keep the one they mounted with: give the grid a new \`key\` when the theme changes.

## Labels and localization

{{story: Speak your users' language}}

### The grid's labels

\`labels\` on \`<Grid.Root />\` takes any of these keys; the rest keep their English default. It is read once, at mount. \`GRID_LABELS\` holds the defaults.

| Key | Default | Where it shows |
|---|---|---|
| \`noRecordsFound\` | No records found. | The overlay of a grid with no rows |
| \`valueLocked\` | This value cannot be edited. | The tooltip of a cell's lock icon, for a single locked value |
| \`recordLocked\` | This record cannot be edited. | The tooltip of the lock at the start of a row locked as a whole |
| \`columnLocked\` | This column cannot be edited. | The tooltip of the lock in a locked column's header |
| \`recordSaveErrorTitle\` | Your changes were not saved | The title of the callout that a failed save's icon opens |
| \`recordSaveErrorDismiss\` | Dismiss | The button in that callout that clears the failure |

Which lock shows where is on [**Editing**](?path=/docs/grid-editing--overview).

### Localizing everything

The grid's \`labels\` cover only the strings above. Each module that draws text takes \`labels\` of its own, and the provider supplies the rest.

| What | Where its strings go | Keys and defaults |
|---|---|---|
| The grid | \`labels\` on \`<Grid.Root />\` | Above |
| Sorting | \`createSortingModule({ labels })\` | [**Sorting and filtering**](?path=/docs/grid-modules-sorting-and-filtering--overview) |
| Filtering | \`createFilteringModule({ labels })\` | [**Sorting and filtering**](?path=/docs/grid-modules-sorting-and-filtering--overview) |
| Grouping | \`createGroupingModule({ labels })\` | [**Grouping and totals**](?path=/docs/grid-modules-grouping-and-totals--overview) |
| Totals | \`createAggregationModule({ labels })\` | [**Grouping and totals**](?path=/docs/grid-modules-grouping-and-totals--overview) |
| Column names, option names and values | The provider: each column's \`displayName\`, the labels in \`metadata.OptionSet\`, and its formatted values | [**Data**](?path=/docs/grid-get-started-data--overview) |

- Keep the \`{{maxGroupChildren}}\` and \`{{maxGroupLoads}}\` placeholders in the grouping labels that have them: the module fills them in.
- Every module's defaults are exported: \`GRID_SORTING_LABELS\`, \`GRID_FILTERING_LABELS\`, \`GRID_GROUPING_LABELS\` and \`GRID_AGGREGATION_LABELS\`.
- Row selection, cell ranges, the clipboard and the legacy client API module draw no text of their own.
- The filter callout names its operators in the user's language from the PCF context, its \`userSettings.languageId\`. Its Apply and Clear buttons are in English only.
`

const meta = {
    title: 'Grid/Appearance',
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

export const SpotTicketsAboutToBreach: Story = {
    name: 'Spot tickets about to breach',
    render: () => renderStory(<SpotBreachesExample />),
    parameters: {
        docs: {
            description: {
                story: `A support lead spots tickets close to their response deadline: \`settings.cell.onGetTheme\` on *Respond by* turns the cell red once the deadline has passed and amber when less than a day is left, and leaves resolved tickets alone. Sort by *Respond by* to bring the urgent ones together.`,
            },
        },
    },
}

export const TintEscalatedTickets: Story = {
    name: 'Tint escalated tickets',
    render: () => renderStory(<EscalatedTicketsExample />),
    parameters: {
        docs: {
            description: {
                story: `Escalated tickets stand out across their whole row through a small module's \`registerCellThemeHook\`, registered at \`GRID_MODULE_PRIORITY.grouping + 1\` so the tint survives grouping, with its text colour from \`getTextColorForBackground\`. Turn on *Escalated* for another ticket and its row turns red, then group by *Status* from its column menu (grouping is AG Grid Enterprise).`,
            },
        },
    },
}

export const CompactOrComfortable: Story = {
    name: 'Compact or comfortable',
    render: () => renderStory(<DensityExample />),
    parameters: {
        docs: {
            description: {
                story: `A shop's product list, dense for scanning or roomy for reading: \`rowHeight\`, \`enableZebra\` and \`enableOptionSetColors\` are read at mount, so the grid gets a new \`key\` whenever one changes. Switch the density, or turn off the colours of *Category* and *Discontinued*.`,
            },
        },
    },
}

export const ColourCodedColumnHeaders: Story = {
    name: 'Colour-coded column headers',
    render: () => renderStory(<HeaderColoursExample />),
    parameters: {
        docs: {
            description: {
                story: `Sales owns the price and the warehouse owns the stock, and \`settings.header.onGetTheme\` colours their headers to match: blue for *Price*, green for *In stock*, *Reorder at* and *Last restocked*. Sort by *Price* and the sort arrow takes the header's colours.`,
            },
        },
    },
}

export const YourBrandLightOrDark: Story = {
    name: 'Your brand, light or dark',
    render: () => renderStory(<BrandThemeExample />),
    parameters: {
        docs: {
            description: {
                story: `A sales pipeline in a company's own teal: \`ThemeGenerator.generate({ primary, background, text })\` builds a light and a dark theme, and a \`ThemeProvider\` hands one to the grid, which mounts again with a new \`key\` on the switch. Turn on *Dark mode*, then open a column's menu.`,
            },
        },
    },
}

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
