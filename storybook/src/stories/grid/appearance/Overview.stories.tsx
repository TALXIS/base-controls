import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ThemeEditExample, DensityExample, EscalatedTicketsExample, HeaderColoursExample, SpotBreachesExample } from '../../../grid/examples/appearanceExamples'

const DESCRIPTION = `
The grid draws in your theme. On top of it you can colour cells and headers by what they hold and pick a density, zebra rows and option set colours. To translate what the grid shows, see [**Localization**](?path=/docs/grid-localization-overview--overview). To replace what the grid draws rather than recolour it, see [**Custom cells**](?path=/docs/grid-appearance-custom-cells--overview), [**Custom headers**](?path=/docs/grid-appearance-custom-headers--overview), [**Custom overlays**](?path=/docs/grid-appearance-custom-overlays--overview), [**Custom rows**](?path=/docs/grid-appearance-custom-rows--overview) and how modules draw their pieces: [**Editing**](?path=/docs/grid-appearance-modules-editing--overview), [**Row selection**](?path=/docs/grid-appearance-modules-row-selection--overview), [**Sorting**](?path=/docs/grid-appearance-modules-sorting--overview), [**Filtering**](?path=/docs/grid-appearance-modules-filtering--overview), [**Grouping**](?path=/docs/grid-appearance-modules-grouping--overview) and [**Totals**](?path=/docs/grid-appearance-modules-totals--overview).

## Colour cells by their data

A column colours its cells with \`context.cell.onGetTheme(theme, { record })\`. To colour across columns, such as a whole row, register \`runtime.services.get('cells').registerCellTheme(hook, priority)\` in a module. Both get the same \`theme\`.

### How it works

- \`theme.colors\` holds \`primary\`, \`background\` and \`text\`. Change any of them and the grid generates the cell's whole palette, so the value, its links and tags, and the editor all follow.
- Changing \`background\` does not change the text colour, so set \`text\` as well. To get a text colour that is readable on your background, call \`getTextColorForBackground(background)\` from \`@talxis/base-controls\`.
- Colours are strings Fluent can parse: hex, \`rgb()\`, \`hsl()\` or a colour name, not CSS variables.
- The theme is applied again whenever the record changes. If it also depends on something else, such as a toggle in your app, call \`runtime.services.get('cells').render()\` when that changes to redraw the cells.

### Which colour wins

Several things can colour the same cell. They run in this order, and the last one wins:

1. Zebra rows shade every other row.
2. Theme hooks from modules (\`registerCellTheme\`), lowest priority first. Built-in modules use them too: grouping shades group rows, and totals shade the totals row.
3. The column's own \`context.cell.onGetTheme\`.

Grouping and totals run late, so a hook at the default priority loses its colour while the rows are grouped. To keep it, register the hook at \`GRID_MODULE_PRIORITY.grouping + 1\`, as the escalated tickets example does, or use \`onGetTheme\` on the column.

{{story: Spot tickets about to breach}}

{{story: Tint escalated tickets}}

### Beyond colours

\`theme.edit(key, edit)\` changes the generated theme itself, such as its fonts. The result is cached under \`key\`, so the same key must always mean the same edit.

{{story: Ticket numbers in a fixed-width font}}

## Colour column headers

A column colours its header with \`context.header.onGetTheme(theme)\`. To colour any header, register \`runtime.services.get('columns').headers.registerColumnHeaderTheme(hook, priority)\` in a module; \`onGetTheme\` runs after it.

- Everything in the header takes the colours: the name, the required marker and the module icons. Its menu keeps the grid's theme.
- Headers redraw after every load. If the colour depends on something else, call \`runtime.services.get('columns').headers.render()\` when it changes.

{{story: Show which columns need a review}}

## Density, zebra rows and option set colours

| Prop | Default | What it does |
|---|---|---|
| \`rowHeight\` | \`42\` | The height of every row, in pixels. |
| \`enableZebra\` | \`true\` | Shades every other row. |
| \`enableOptionSetColors\` | \`false\` | Draws option set and two-options values as tags in their option's colour. |

All three are read at mount, so give the grid a new \`key\` to change them.

{{story: Compact or comfortable}}
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
                story: `A support lead spots tickets close to their response deadline: \`context.cell.onGetTheme\` on *Respond by* turns the cell red once the deadline has passed and amber when less than a day is left, and leaves resolved tickets alone. Sort by *Respond by* to bring the urgent ones together.`,
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
                story: `Escalated tickets stand out across their whole row through a small module's \`registerCellTheme\`, registered at \`GRID_MODULE_PRIORITY.grouping + 1\` so the tint survives grouping, with its text colour from \`getTextColorForBackground\` (exported by \`@talxis/base-controls\`). Turn on *Escalated* for another ticket and its row turns red, then group by *Status* from its column menu (grouping is AG Grid Enterprise).`,
            },
        },
    },
}

export const TicketNumbersInAFixedWidthFont: Story = {
    name: 'Ticket numbers in a fixed-width font',
    render: () => renderStory(<ThemeEditExample />),
    parameters: {
        docs: {
            description: {
                story: `\`theme.edit\` swaps the Ticket column's font for a monospace one, keyed \`'monospace'\` so every cell shares one theme. Double-click a ticket number: the editor uses the font too.`,
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
                story: `A product list, dense for scanning or roomy for reading. Switch the density, or turn off the colours of *Category* and *Discontinued*.`,
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
                story: `Before saving a week of timesheets, the headers say where to look: amber for a column with unsaved changes, red for one holding a value that will not save. Change some hours, or enter 20, then Save or Discard.`,
            },
        },
    },
}
