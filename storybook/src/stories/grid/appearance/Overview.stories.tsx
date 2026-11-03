import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ColumnLinesExample, DensityExample, EscalatedTicketsExample, FillContainerExample, HeaderColoursExample, InvoiceLinesExample, SpotBreachesExample, ThemeEditExample } from '../../../grid/examples/appearanceExamples'

const DESCRIPTION = `
The grid draws in your Fluent theme. On top of it you can size it, pick a density, colour cells and headers by what they hold, and replace what it draws, from a single icon to a whole column's cells. This page maps every way in and covers the ones that are props and theme hooks; the pages under it cover cells, headers, overlays and rows.

## What you can change

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

What the grid draws takes a \`components\` map: on \`<Grid>\`, on a module, or in a column's \`cellRendererParams\` and \`headerComponentParams\`. Its keys name the pieces, and each ends in *slots*, functions named \`onRender…\` that get the props their default draws with and return an element, or \`null\`. A slot you leave out keeps its default, and a nested key merges over the default slot by slot.

| To | Write |
|---|---|
| Change one prop of the default | \`props => GridSortingIconComponents.onRenderIcon({ ...props, styles: { root: { color: 'red' } } })\` |
| Wrap the default | \`props => <TooltipHost content='Sorted'>{GridSortingIconComponents.onRenderIcon(props)}</TooltipHost>\` |
| Replace it | \`props => <Icon {...props} iconName='SortUp' />\` |
| Remove it | \`() => null\` |

Spread the props you get: they carry the class names, handlers and refs that make the piece work. A slot is called during render, so to use hooks there, return a component of your own: \`props => <MyIcon {...props} />\`. Every page that offers \`components\` lists them under *Changing how it looks*, in one table: the *Key*, its *Slots*, the *Default* a slot can call, and what it *Draws*. A blank *Default* is not exported, so a slot there draws its own element.

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

To colour a cell by a hue, call \`builder.tint(hue)\`, or \`builder.tint(hue, 'strong')\` for a fill. It works out the background and text from the colours the cell already has, so the same hue reads in a light theme and a dark one. For full control, \`builder.colors\` holds \`primary\`, \`background\` and \`text\`. Change any of them and the grid generates the cell's whole palette, so the value, its links and tags, and the editor all follow. A new background does not change the text colour, so set \`text\` too; \`getTextColorForBackground(background)\` returns a readable one. Colours are strings Fluent can parse, such as hex, \`rgb()\` or a colour name, not CSS variables. The theme is applied again whenever the record changes; if it depends on anything else, see *Redrawing* on [**Talking to the grid**](?path=/docs/controls-grid-talking-to-the-grid--overview).

{{story: Flag tickets about to breach}}

Zebra rows, grouping and totals colour rows too. A row hook at the default priority loses to grouping while the rows are grouped, so register it at \`GRID_MODULE_PRIORITY.grouping + 1\` (see *How hooks run* on [**Hooks**](?path=/docs/controls-grid-extending-hooks--overview)).

{{story: Tint escalated tickets}}

\`builder.edit(key, edit)\` changes the generated theme itself, such as its fonts. The result is cached under \`key\`, so the same key must always mean the same edit.

{{story: Show ticket numbers in a fixed-width font}}

## Colour column headers

A column colours its header with \`context.header.onGetTheme(builder)\`. To colour any header, register \`grid.services.get('columns').headers.registerColumnHeaderTheme(hook, priority?)\` in a module; \`onGetTheme\` runs after it. Everything in the header takes the colours: the name, the required marker and the module icons, while its menu keeps the grid's theme. Headers redraw after every load; if the colour depends on anything else, call \`headers.render()\`.

{{story: Show which columns need a review}}

## Change the AG Grid theme

Under the cells, AG Grid draws the grid itself: the row lines, hover and selection, the focus and range borders, and its popups. The grid builds that theme from your Fluent theme as it mounts, with no lines between columns and no frame. To change it, register \`registerTheme(hook, priority?)\` on the \`gridTheme\` service in a module and replace \`result.theme\`, usually with \`withParams\`. Colour cells and headers through the hooks above rather than AG Grid's parameters. The mapping and the parameters are under *The AG Grid theme* on [**AG Grid**](?path=/docs/controls-grid-extending-ag-grid--overview).

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
                story: `Escalated tickets tinted across their whole row by a module's \`registerCellTheme\` at \`GRID_MODULE_PRIORITY.grouping + 1\` with \`builder.tint\`. Try: turn on *Escalated* for another ticket, then group by *Status* from its column menu (AG Grid Enterprise).`,
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
                story: `\`theme.edit\` swaps the Ticket column's font for a monospace one, keyed \`'monospace'\` so every cell shares one theme. Try: double-click a ticket number to see the editor use the font too.`,
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
