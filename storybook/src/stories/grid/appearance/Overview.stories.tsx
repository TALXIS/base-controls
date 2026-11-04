import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ColumnLinesExample, DensityExample, EscalatedTicketsExample, FillContainerExample, HeaderColoursExample, InvoiceLinesExample, SpotBreachesExample, ThemeEditExample } from '../../../grid/examples/appearanceExamples'

const DESCRIPTION = `
The grid draws in the app theme (see [**Theming**](?path=/docs/concepts-theming--overview)), so it matches the rest of your page with no setup. From there you change only as much as the page needs: how tall the grid is and how dense its rows, colours that tell the user what a cell or a header holds, or your own drawing in place of anything the grid draws, from a single icon to a whole column's cells.

{{story: Flag tickets about to breach}}

## What you can change

Each change has its own way in. This page covers the props and theme hooks; the pages under it cover cells, headers, overlays and rows.

| To change | Use | Read | Where |
|---|---|---|---|
| The grid's height | \`height\`, \`maxVisibleRows\` | On every render | *Size the grid* below |
| Density, zebra rows, option set colours | \`rowHeight\`, \`enableZebra\`, \`enableOptionSetColors\` | At mount | *Density, zebra rows and option set colours* below |
| A cell's colours and fonts | \`context.cell.onGetTheme\` in \`colDefs\`, or \`cells.registerCellTheme\` in a module | Each time the cell draws | *Colour cells by their data* below |
| A header's colours | \`context.header.onGetTheme\`, or \`columns.headers.registerColumnHeaderTheme\` | Each time the header draws | *Colour column headers* below |
| Lines, borders and AG Grid's own colours | \`gridTheme.registerTheme\` in a module | At mount | *Change the AG Grid theme* below |
| One row's height, or a class on rows | \`rowSettings.onGetHeight\`, \`rows.registerRowClass\` | Each time the row draws | [**Hooks**](?path=/docs/controls-grid-extending-hooks--overview) |
| What a header shows beside its name, its menu, a cell's commands | \`context.header.onGetAdornments\`, \`onGetMenuSections\`, \`context.cell.onGetCommands\` | Each time it draws | [**Columns**](?path=/docs/controls-grid-columns--overview) |
| A column's cells and editor | \`cellRendererParams\` or \`cellRenderer\`, \`cellEditor\` in \`colDefs\` | With the columns | [**Custom cells**](?path=/docs/controls-grid-appearance-custom-cells--overview) |
| A column's header | \`headerComponentParams\` or \`headerComponent\` in \`colDefs\` | With the columns | [**Custom headers**](?path=/docs/controls-grid-appearance-custom-headers--overview) |
| The loading and empty overlays, the loading and error rows | \`components\` on \`<Grid>\` | On every render | [**Overlays and rows**](?path=/docs/controls-grid-appearance-overlays-and-rows--overview) |
| Sort arrows, filter funnels and callout, group cells, totals | the module's \`components\` option | At mount | [**Sorting and filtering**](?path=/docs/controls-grid-modules-sorting-and-filtering--overview), [**Grouping and totals**](?path=/docs/controls-grid-modules-grouping-and-totals--overview) |
| The save status, the lock column, the checkboxes | the module's column in \`colDefs\` | With the columns | [**Editing**](?path=/docs/controls-grid-modules-editing--overview), [**Selection and clipboard**](?path=/docs/controls-grid-modules-selection-and-clipboard--overview) |
| Every text the grid shows | label keys through \`LabelsProvider\` | Each time it draws | [**Localization**](?path=/docs/concepts-localization--overview) |

## Changing how it looks

What the grid draws takes a \`components\` map: on \`<Grid>\`, on a module, or in a column's \`cellRendererParams\` and \`headerComponentParams\`. How its pieces and slots work is on [**DatasetControl › Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview).

Every Grid page that offers \`components\` lists them under *Changing how it looks*: the *Key*, its *Slots*, the *Default* a slot can call, and what it *Draws*. A blank *Default* is not exported, so a slot there draws its own element.

## Size the grid

Without a \`height\`, the grid grows with its rows. The rows area grows up to \`maxVisibleRows\` × \`rowHeight\`, 630px by default, and then scrolls; the header and the totals row come on top, and with no rows the area stays 135px tall for the *No records found.* message.

{{story: Grow with the invoice lines}}

With a \`height\`, the grid is exactly that tall and its rows scroll inside it, whatever \`maxVisibleRows\` says; \`'100%'\` fills a parent that has a height of its own. Inside a DatasetControl that has a \`height\`, the grid fills the control's body whatever its own props say. The grid is never shorter than 220px.

{{story: Fill the container}}

## Density, zebra rows and option set colours

| Prop | Default | Description |
|---|---|---|
| \`rowHeight\` | \`42\` | The height of every row, in pixels. |
| \`enableZebra\` | \`true\` | Shades every other row. |
| \`enableOptionSetColors\` | \`false\` | Draws option set and two-options values as tags in their option's colour. |

All three are read at mount: see *Change a prop that is read at mount* on [**Props and events**](?path=/docs/controls-grid-props-and-events--overview).

{{story: Switch the density}}

## Colour cells by their data

A column colours its cells with \`context.cell.onGetTheme(builder, { record })\`. To colour across columns, such as a whole row, register \`grid.services.get('cells').registerCellTheme(hook, priority?)\` in a module; the column's own \`onGetTheme\` runs after the hooks.

- \`builder.tint(hue)\` colours a cell by a hue, and \`builder.tint(hue, 'strong')\` fills it.
- For full control, set \`builder.colors\` (\`primary\`, \`background\`, \`text\`); the cell's value, links, tags and editor all follow.
- Colour formats and helpers such as \`getTextColorForBackground\` are under *Your own components* on [**Theming**](?path=/docs/concepts-theming--overview).
- The theme is applied again whenever the record changes; if it depends on anything else, see *Redrawing* on [**Talking to the grid**](?path=/docs/controls-grid-talking-to-the-grid--overview).

The example at the top of this page colours *Respond by* this way.

Zebra rows, grouping and totals colour rows too. A row hook at the default priority loses to grouping while the rows are grouped, so register it at \`GRID_MODULE_PRIORITY.grouping + 1\` (see *How hooks run* on [**Hooks**](?path=/docs/controls-grid-extending-hooks--overview)).

{{story: Tint escalated tickets}}

\`builder.edit(key, edit)\` changes the generated theme itself, such as its fonts. The result is cached under \`key\`, so the same key must always mean the same edit.

{{story: Show ticket numbers in a fixed-width font}}

## Colour column headers

A column colours its header with \`context.header.onGetTheme(builder)\`. To colour any header, register \`grid.services.get('columns').headers.registerColumnHeaderTheme(hook, priority?)\` in a module; \`onGetTheme\` runs after it. Everything in the header takes the colours: the name, the required marker and the module icons; its menu draws in the app theme (see *Surfaces* on [**Theming**](?path=/docs/concepts-theming--overview)). Headers redraw after every load; if the colour depends on anything else, call \`headers.render()\`.

{{story: Show which columns need a review}}

## Change the AG Grid theme

Under the cells, AG Grid draws the grid itself: the row lines, hover and selection, the focus and range borders, and its popups. The grid builds that theme from the app theme as it mounts, with no lines between columns and no frame.

To change it, register \`registerTheme(hook, priority?)\` on the \`gridTheme\` service in a module and replace \`result.theme\`, usually with \`withParams\`. Colour cells and headers through the hooks above instead. The parameters are under *The AG Grid theme* on [**AG Grid**](?path=/docs/controls-grid-extending-ag-grid--overview).

{{story: Draw lines between columns}}
`

const meta = {
    title: 'Controls/Grid/Appearance',
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
    name: 'Flag tickets about to breach',
    render: () => renderStory(<SpotBreachesExample />),
    parameters: {
        docs: {
            description: {
                story: `Support tickets close to their response deadline: \`context.cell.onGetTheme\` on *Respond by* turns the cell red once the deadline has passed and amber when less than a day is left. Try: sort by *Respond by* to bring the urgent ones together.`,
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
                story: `A module's \`registerCellTheme\` tints the whole row of every escalated ticket. Try: turn on *Escalated* for another ticket, then group by *Status*.`,
            },
        },
    },
}

export const TicketNumbersInAFixedWidthFont: Story = {
    name: 'Show ticket numbers in a fixed-width font',
    render: () => renderStory(<ThemeEditExample />),
    parameters: {
        docs: {
            description: {
                story: `\`builder.edit\` swaps the Ticket column's font for a monospace one, keyed \`'monospace'\` so every cell shares one theme. Try: double-click a ticket number to see the editor use the font too.`,
            },
        },
    },
}

export const ShowWhichColumnsNeedAReview: Story = {
    name: 'Show which columns need a review',
    render: () => renderStory(<HeaderColoursExample />),
    parameters: {
        docs: {
            description: {
                story: `Timesheet headers turn amber for a column with unsaved changes and red for one holding a value that will not save. Try: change some hours, or enter 20, then Save or Discard.`,
            },
        },
    },
}

export const LinesBetweenColumns: Story = {
    name: 'Draw lines between columns',
    render: () => renderStory(<ColumnLinesExample />),
    parameters: {
        docs: {
            description: {
                story: `A product list that reads like a spreadsheet: a module's \`registerTheme\` adds \`columnBorder\`, \`headerColumnBorder\` and \`wrapperBorder\` in the Fluent divider colour, and a taller header. Try: change \`headerHeight\` in the code.`,
            },
        },
    },
}

export const CompactOrComfortable: Story = {
    name: 'Switch the density',
    render: () => renderStory(<DensityExample />),
    parameters: {
        docs: {
            description: {
                story: `A product list, dense for scanning or roomy for reading. Try: switch the density, or turn off the colours of *Category* and *Discontinued*.`,
            },
        },
    },
}

export const InvoiceLinesThatGrow: Story = {
    name: 'Grow with the invoice lines',
    render: () => renderStory(<InvoiceLinesExample />),
    parameters: {
        docs: {
            description: {
                story: `An invoice's line items in a grid with no \`height\`, growing up to \`maxVisibleRows\`. Try: add lines until it scrolls, move the slider to change \`maxVisibleRows\`, or remove lines until it stays 220px tall.`,
            },
        },
    },
}

export const FillItsContainer: Story = {
    name: 'Fill the container',
    render: () => renderStory(<FillContainerExample />),
    parameters: {
        docs: {
            description: {
                story: `A DatasetControl with \`height='100%'\` fills its container, and the grid fills the control's body. Try: move the slider to change the container's height.`,
            },
        },
    },
}
