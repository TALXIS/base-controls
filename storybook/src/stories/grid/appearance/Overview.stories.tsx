import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { ColumnLinesExample, DensityExample, EscalatedTicketsExample, FillContainerExample, HeaderColoursExample, InvoiceLinesExample, SpotBreachesExample, ThemeEditExample } from '../../../grid/examples/appearanceExamples'

const DESCRIPTION = `
The grid draws in the app theme (see [**Theming**](?path=/docs/concepts-theming--overview)). From there you change only what the page needs: how tall the grid is and how dense its rows, colours that say what a cell or a header holds, or your own drawing in place of anything the grid draws. Try it below: sort by *Respond by*.

{{canvas: Flag tickets about to breach}}

## What you can change

Size, density and colours are on this page. Whatever else the grid draws takes a \`components\` map of pieces and slots, on the grid, on a module, or in a column's \`cellRendererParams\` and \`headerComponentParams\`; each page below lists its own under *Changing how it looks*, and how pieces and slots work is on [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| To change | See |
|---|---|
| The grid's height, row density, zebra rows, option set colours and the AG Grid theme | This page |
| A cell's or a header's colours, by their data | This page |
| What a column's header shows beside the name, its menu and its cells' commands | [**Columns**](?path=/docs/controls-grid-columns--overview) |
| A column's cells and editor | [**Custom cells**](?path=/docs/controls-grid-appearance-custom-cells--overview) |
| A column's header | [**Custom headers**](?path=/docs/controls-grid-appearance-custom-headers--overview) |
| The overlays, and the loading and error rows | [**Overlays and rows**](?path=/docs/controls-grid-appearance-overlays-and-rows--overview) |
| One row's height, or a class on rows | [**Hooks**](?path=/docs/controls-grid-extending-hooks--overview) |
| Sort arrows, filter funnels, group cells and totals | [**Sorting and filtering**](?path=/docs/controls-grid-modules-sorting-and-filtering--overview), [**Grouping and totals**](?path=/docs/controls-grid-modules-grouping-and-totals--overview) |
| The save status, the lock column and the checkboxes | [**Editing**](?path=/docs/controls-grid-modules-editing--overview), [**Selection and clipboard**](?path=/docs/controls-grid-modules-selection-and-clipboard--overview) |
| Every label | [**Localization**](?path=/docs/concepts-localization--overview) |

## Size the grid

Without a \`height\`, the grid grows with its rows. The rows area grows up to \`maxVisibleRows\` × \`rowHeight\`, 630px by default, and then scrolls; the header and the totals row come on top, and with no rows the area stays 135px tall for the *No records found.* message.

{{story: Grow with the invoice lines}}

With a \`height\`, the grid is exactly that tall and its rows scroll inside it, whatever \`maxVisibleRows\` says; \`'100%'\` fills a parent that has a height of its own. Inside a DatasetControl that has a \`height\`, the grid fills the control's body whatever its own props say. The grid is never shorter than 220px.

{{story: Fill the container}}

## Density, zebra rows and option set colours

\`rowHeight\` sets the height of every row, \`enableZebra\` shades every other row, and \`enableOptionSetColors\` draws option set and two options values as tags in their option's colour. All three are *At mount*; their defaults are on [**Props and events**](?path=/docs/controls-grid-props-and-events--overview).

{{story: Switch the density}}

## Colour cells by their data

Add a hook to \`grid.services.get('cells').hooks.theme\`, in \`onSetup\` or a module. It runs for every cell with \`(builder, { record, columnName })\`: check \`columnName\` to colour one column, as the example at the top does, or leave it out to colour a whole row.

\`builder.tint(hue, strength?)\` tints a cell by a hue: \`'subtle'\` by default, \`'strong'\`, or \`'solid'\`, which fills it. For full control, set \`builder.colors\` (\`primary\`, \`background\`, \`text\`), and the cell's value, links, tags and editor all follow. Colour formats and helpers such as \`getTextColorForBackground\` are on [**Theming**](?path=/docs/concepts-theming--overview).

The theme is applied again whenever the record changes; if it depends on anything else, see *Redrawing* on [**Talking to the grid**](?path=/docs/controls-grid-talking-to-the-grid--overview). Zebra rows and grouping colour rows too, and while the rows are grouped, grouping wins over a hook at the default priority, so add a hook that colours a row at \`GRID_MODULE_PRIORITY.grouping + 1\` (see *How hooks run* on [**Hooks**](?path=/docs/controls-grid-extending-hooks--overview)).

{{story: Tint escalated tickets}}

\`builder.edit(key, edit)\` changes the generated theme itself, such as its fonts. The result is cached under \`key\`, so the same key must always mean the same edit.

{{story: Show ticket numbers in a fixed-width font}}

## Colour column headers

Add a hook to \`grid.services.get('columns').headers.hooks.theme\`. It runs for every header with \`(builder, header)\`; check \`header.getColDef().colId\` to colour one column. Everything in the header takes the colours, the name, the required marker and the module icons, while its menu draws in the app theme (see *Surfaces* on [**Theming**](?path=/docs/concepts-theming--overview)). Headers redraw after every load; if the colour depends on anything else, call \`headers.render()\`, as the example does.

{{story: Show which columns need a review}}

## Change the AG Grid theme

Under the cells, AG Grid draws the row lines, hover and selection, the focus and range borders and its popups, in a theme the grid builds from the app theme: see *The AG Grid theme* on [**AG Grid**](?path=/docs/controls-grid-extending-ag-grid--overview). To change it, add a hook to \`grid.services.get('gridTheme').hooks.theme\` in a module and replace \`result.theme\`, usually with \`withParams\`. Colour cells and headers through the hooks above instead.

{{story: Draw lines between columns}}

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Custom cells', iconName: 'TableComputed', href: '?path=/docs/controls-grid-appearance-custom-cells--overview', text: 'Redraw pieces of a column\'s cells, or lay a cell out yourself.' },
    { title: 'Custom headers', iconName: 'Header', href: '?path=/docs/controls-grid-appearance-custom-headers--overview', text: 'Add to a column\'s header, or lay it out from its parts.' },
    { title: 'Overlays and rows', iconName: 'Info', href: '?path=/docs/controls-grid-appearance-overlays-and-rows--overview', text: 'Redraw what the grid shows while it loads or has no records.' },
]

const meta = {
    title: 'Controls/Grid/Appearance',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { explore: () => <ExploreCards cards={EXPLORE} /> }),
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
}

export const TintEscalatedTickets: Story = {
    name: 'Tint escalated tickets',
    render: () => renderStory(<EscalatedTicketsExample />),
    parameters: {
        docs: {
            description: {
                story: `A module's \`hooks.theme\` tints the whole row of every escalated ticket. Try: turn on *Escalated* for another ticket.`,
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
                story: `Timesheet headers turn amber for a column with unsaved changes and red for one holding a value that will not save. Try: enter 20 in an entry's *Hours*.`,
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
                story: `A module's \`hooks.theme\` adds lines between the columns and a frame round the grid. Try: change \`headerHeight\` in the code.`,
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
                story: `A product list, dense for scanning or roomy for reading. Try: switch the density.`,
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
                story: `An invoice's line items in a grid with no \`height\`, growing up to \`maxVisibleRows\`. Try: add lines until it scrolls.`,
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
