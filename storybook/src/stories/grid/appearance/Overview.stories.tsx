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

- **The grid:** its height and density, zebra rows and option set colours, and the AG Grid theme under the cells, all on this page. When each prop is read is on [**Props and events**](?path=/docs/controls-grid-props-and-events--overview).
- **Colours:** a cell's or a header's, by their data, on this page.
- **A column:** what its header shows beside the name, its menu and its cells' commands on [**Columns**](?path=/docs/controls-grid-columns--overview); its cells and editor on [**Custom cells**](?path=/docs/controls-grid-appearance-custom-cells--overview); its header on [**Custom headers**](?path=/docs/controls-grid-appearance-custom-headers--overview).
- **Rows:** one row's height or a class on rows on [**Hooks**](?path=/docs/controls-grid-extending-hooks--overview); the overlays and the loading and error rows on [**Overlays and rows**](?path=/docs/controls-grid-appearance-overlays-and-rows--overview).
- **What modules draw:** sort arrows, filter funnels, group cells and totals on [**Sorting and filtering**](?path=/docs/controls-grid-modules-sorting-and-filtering--overview) and [**Grouping and totals**](?path=/docs/controls-grid-modules-grouping-and-totals--overview); the save status, the lock column and the checkboxes on [**Editing**](?path=/docs/controls-grid-modules-editing--overview) and [**Selection and clipboard**](?path=/docs/controls-grid-modules-selection-and-clipboard--overview).
- **Text:** every label, through \`LabelsProvider\`, on [**Localization**](?path=/docs/concepts-localization--overview).

## Changing how it looks

What the grid draws takes a \`components\` map: on \`<Grid>\`, on a module, or in a column's \`cellRendererParams\` and \`headerComponentParams\`. How its pieces and slots work is on the DatasetControl's [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview).

- Each Grid page that takes \`components\` has a *Changing how it looks* table: a piece's key, its slots, the default set and what it draws.
- A slot can call the default set's function of the same name to draw the grid's own element.
- A piece with no default set leaves its slots to draw their own element.

## Size the grid

Without a \`height\`, the grid grows with its rows. The rows area grows up to \`maxVisibleRows\` × \`rowHeight\`, 630px by default, and then scrolls; the header and the totals row come on top, and with no rows the area stays 135px tall for the *No records found.* message.

{{story: Grow with the invoice lines}}

With a \`height\`, the grid is exactly that tall and its rows scroll inside it, whatever \`maxVisibleRows\` says; \`'100%'\` fills a parent that has a height of its own. Inside a DatasetControl that has a \`height\`, the grid fills the control's body whatever its own props say. The grid is never shorter than 220px.

{{story: Fill the container}}

## Density, zebra rows and option set colours

\`rowHeight\` sets the height of every row, \`enableZebra\` shades every other row, and \`enableOptionSetColors\` draws option set and two options values as tags in their option's colour. All three are *At mount*; their defaults are on [**Props and events**](?path=/docs/controls-grid-props-and-events--overview).

{{story: Switch the density}}

## Colour cells by their data

A column colours its cells with \`context.cell.onGetTheme(builder, { record })\`. To colour across columns, such as a whole row, register \`grid.services.get('cells').registerCellTheme(hook, priority?)\` in a module; the column's own \`onGetTheme\` runs after the hooks.

- \`builder.tint(hue, strength?)\` tints a cell by a hue: \`'subtle'\` by default, \`'strong'\`, or \`'solid'\`, which fills it.
- For full control, set \`builder.colors\` (\`primary\`, \`background\`, \`text\`); the cell's value, links, tags and editor all follow.
- Colour formats and helpers such as \`getTextColorForBackground\` are under *Your own components* on [**Theming**](?path=/docs/concepts-theming--overview).
- The theme is applied again whenever the record changes; if it depends on anything else, see *Redrawing* on [**Talking to the grid**](?path=/docs/controls-grid-talking-to-the-grid--overview).
- Zebra rows, grouping and totals colour rows too. A row hook at the default priority loses to grouping while the rows are grouped, so register it at \`GRID_MODULE_PRIORITY.grouping + 1\` (see *How hooks run* on [**Hooks**](?path=/docs/controls-grid-extending-hooks--overview)).

{{story: Tint escalated tickets}}

\`builder.edit(key, edit)\` changes the generated theme itself, such as its fonts. The result is cached under \`key\`, so the same key must always mean the same edit.

{{story: Show ticket numbers in a fixed-width font}}

## Colour column headers

A column colours its header with \`context.header.onGetTheme(builder)\`. To colour any header, register \`grid.services.get('columns').headers.registerColumnHeaderTheme(hook, priority?)\` in a module; \`onGetTheme\` runs after it.

- Everything in the header takes the colours: the name, the required marker and the module icons.
- Its menu draws in the app theme: see *Surfaces* on [**Theming**](?path=/docs/concepts-theming--overview).
- Headers redraw after every load; if the colour depends on anything else, call \`headers.render()\`.

{{story: Show which columns need a review}}

## Change the AG Grid theme

Under the cells, AG Grid draws the row lines, hover and selection, the focus and range borders and its popups, in a theme the grid builds from the app theme: see *The AG Grid theme* on [**AG Grid**](?path=/docs/controls-grid-extending-ag-grid--overview). To change it, register \`registerTheme(hook, priority?)\` on the \`gridTheme\` service in a module and replace \`result.theme\`, usually with \`withParams\`. Colour cells and headers through the hooks above instead.

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
                story: `A module's \`registerCellTheme\` tints the whole row of every escalated ticket. Try: turn on *Escalated* for another ticket.`,
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
                story: `A module's \`registerTheme\` adds lines between the columns and a frame round the grid. Try: change \`headerHeight\` in the code.`,
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
