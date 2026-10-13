import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ColumnLinesExample, DensityExample, EscalatedTicketsExample, HeaderColoursExample, SpotBreachesExample, ThemeEditExample } from '../../../grid/examples/appearanceExamples'

import { FillContainerExample, InvoiceLinesExample } from '../../../grid/examples/propsAndEventsExamples'
const DESCRIPTION = `
The grid draws in your Fluent theme. On top of it you can size it, pick a density, colour cells and headers by what they hold, and replace anything it draws with your own. To translate what the grid shows, see [**Localization**](?path=/docs/grid-localization--overview).

## Size the grid

Without a \`height\`, the grid grows with its rows:

- The rows area grows up to \`maxVisibleRows\` × \`rowHeight\`, 630px by default, then scrolls. Taller rows reach that sooner.
- The header and the totals row are added on top.
- With no rows, the rows area stays 135px tall for the *No records found.* message.

{{story: Grow with the invoice lines}}

With a \`height\`, the grid is exactly that tall and its rows scroll inside it; \`maxVisibleRows\` is ignored. \`'100%'\` fills a parent that has its own height.

{{story: Fill the container}}

- Inside a DatasetControl that has a \`height\`, the grid fills the control's body, whatever its own \`height\` and \`maxVisibleRows\` say.
- The grid is never shorter than 220px, so \`height='150px'\` still draws 220px.

## Density, zebra rows and option set colours

| Prop | Default | Description |
|---|---|---|
| \`rowHeight\` | \`42\` | The height of every row, in pixels. |
| \`enableZebra\` | \`true\` | Shades every other row. |
| \`enableOptionSetColors\` | \`false\` | Draws option set and two-options values as tags in their option's colour. |

All three are read at mount: see *Change a prop that is read at mount* on [**Props and events**](?path=/docs/grid-props-and-events--overview).

{{story: Switch the density}}

## Colour cells by their data

A column colours its cells with \`context.cell.onGetTheme(theme, { record })\`. To colour across columns, such as a whole row, register \`grid.services.get('cells').registerCellTheme(hook, priority)\` in a module. Both get the same \`theme\`.

- \`theme.colors\` holds \`primary\`, \`background\` and \`text\`. Change any of them and the grid generates the cell's whole palette, so the value, its links and tags, and the editor all follow.
- Changing \`background\` does not change the text colour, so set \`text\` as well. \`getTextColorForBackground(background)\` from \`@talxis/base-controls\` returns a readable one.
- Colours are strings Fluent can parse: hex, \`rgb()\`, \`hsl()\` or a colour name, not CSS variables.
- The theme is applied again whenever the record changes. If it depends on anything else, see *Redrawing* on [**Talking to the grid**](?path=/docs/grid-talking-to-the-grid--overview).

{{story: Flag tickets about to breach}}

Zebra rows, grouping and totals colour rows too, and the column's own \`onGetTheme\` runs last. A row hook at the default priority loses to grouping while the rows are grouped, so register it at \`GRID_MODULE_PRIORITY.grouping + 1\`. See *How hooks run* on [**Hooks**](?path=/docs/grid-extending-hooks--overview).

{{story: Tint escalated tickets}}

\`theme.edit(key, edit)\` changes the generated theme itself, such as its fonts. The result is cached under \`key\`, so the same key must always mean the same edit.

{{story: Show ticket numbers in a fixed-width font}}

## Colour column headers

A column colours its header with \`context.header.onGetTheme(theme)\`. To colour any header, register \`grid.services.get('columns').headers.registerColumnHeaderTheme(hook, priority)\` in a module; \`onGetTheme\` runs after it.

- Everything in the header takes the colours: the name, the required marker and the module icons. Its menu keeps the grid's theme.
- Headers redraw after every load. If the colour depends on anything else, see *Redrawing* on [**Talking to the grid**](?path=/docs/grid-talking-to-the-grid--overview).

{{story: Show which columns need a review}}

## Replace what the grid draws

| What | Where | Page |
|---|---|---|
| A column's cells and editors | \`cellRenderer\`, \`cellEditor\` in \`colDefs\` | [**Custom cells**](?path=/docs/grid-appearance-custom-cells--overview) |
| A column's header | \`headerComponent\` in \`colDefs\` | [**Custom headers**](?path=/docs/grid-appearance-custom-headers--overview) |
| The loading and empty overlays, the loading and error rows | \`components.overlays\`, \`components.rows\` | [**Overlays and rows**](?path=/docs/grid-appearance-overlays-and-rows--overview) |
| What a module draws | The module's \`components\` option, or its column in \`colDefs\` | *Changing how it looks* on the module's page under **Modules** |

Most of them take \`components\`: an object of keys, each holding \`onRender...\` parts. These rules hold for every one of them:

- Every key and part is optional: what you leave out keeps its default.
- A part is called, not mounted, so it can't use React hooks itself. Return a component that does.
- Define \`components\` outside your component, so the grid does not redraw on every render.

## Change the AG Grid theme

Under the cells, AG Grid draws the grid itself: the row lines, hover and selection, the focus and range borders, and its popups. The grid builds that theme from your Fluent theme as it mounts, with no lines between columns and no frame.

To change it, register a hook with \`registerTheme(hook, priority?)\` on the \`gridTheme\` service, in a module, and replace \`result.theme\`, usually with \`withParams\`. Colour cells and headers through the hooks above, not AG Grid's parameters. The full mapping and the parameters are under *The AG Grid theme* on [**AG Grid**](?path=/docs/grid-extending-ag-grid--overview).

{{story: Draw lines between columns}}
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
                story: `Escalated tickets tinted across their whole row by a module's \`registerCellTheme\` at \`GRID_MODULE_PRIORITY.grouping + 1\`, with the text colour from \`getTextColorForBackground\`. Try: turn on *Escalated* for another ticket, then group by *Status* from its column menu (AG Grid Enterprise).`,
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
                story: `A grid with \`height='100%'\` fills its container and resizes with it. Try: move the slider to change the container's height.`,
            },
        },
    },
}
