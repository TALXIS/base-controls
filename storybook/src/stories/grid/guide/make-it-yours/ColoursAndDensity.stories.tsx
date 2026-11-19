import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../grid/guide/gridGuide'
import { ColoursAndDensityExample, SizeTheGridExample } from '../../../../grid/guide/make-it-yours/coloursAndDensityExamples'

const STEP = 'Colours and density'

const DESCRIPTION = `
{{block: progress}}

The grid should look as the team's app does, and overdue deals should catch the eye. This step sets the row height and option colours, and colours cells, headers and lines from hooks.

{{canvas: Colours and density}}

## How it works

Like [**Shape the columns**](?path=/docs/controls-grid-guide-make-it-yours-shape-the-columns--overview), this step starts from *the deal grid*; it sets two props on the grid, and adds an \`onSetup\` with three theme hooks. In **Code**, the new lines carry \`//new:\`.

The grid draws in the app theme, as [**Theming**](?path=/docs/concepts-theming--overview) shows. What this step changes stays inside the grid.

**Density and colours.** Three props decide how dense the rows are and how option sets look:

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| \`rowHeight\` | \`number\` | \`42\` | At mount | The height of every row and of the header, in pixels |
| \`enableZebra\` | \`boolean\` | \`true\` | At mount | Shades every other row |
| \`enableOptionSetColors\` | \`boolean\` | \`false\` | At mount | Draws option set and two options values as tags in their options' colours |

A prop read at mount takes effect on the grid's next mount, as [**From your code**](?path=/docs/controls-grid-guide-advanced-from-your-code--overview) explains.

**Colour cells by their data.** \`cells.hooks.theme\` runs for every cell with \`(builder, { record, columnName })\`. Check \`columnName\` to colour one column, as the example does for *Close date*, or leave the check out to colour the whole row.

| On the builder | Does |
|---|---|
| \`tint(hue, strength?)\` | Mixes a hue into the cell, so it reads in a light theme and a dark one: \`'subtle'\` by default, \`'strong'\`, or \`'solid'\`, which fills the cell |
| \`colors\` | \`primary\`, \`background\` and \`text\`, to set yourself; the value, its links and tags, and the editor follow them |
| \`edit(key, edit)\` | Changes the cell's theme itself, such as its fonts; the result is kept under \`key\`, so one key must always mean the same edit |

The grid applies the theme again whenever the record changes. A hook that reads anything else needs the grid to draw again, as *Redrawing* on [**Hooks**](?path=/docs/controls-grid-guide-advanced-hooks--overview) shows. Zebra rows and grouping colour rows too, and while the rows are grouped, grouping wins over a hook at the default priority: add a hook that colours a row at \`GRID_MODULE_PRIORITY.grouping + 1\`, as *How hooks run* on [**Lock closed deals**](?path=/docs/controls-grid-guide-features-lock-closed-deals--overview) explains.

**Colour headers.** \`columns.headers.hooks.theme\` runs for every header with \`(builder, header)\`: check \`header.getColDef().colId\` to colour one. The name, the required marker and the modules' icons take the colours, and the column's menu stays in the app theme. Headers draw again after every load; when a header's colour depends on anything else, call \`headers.render()\`.

**The AG Grid theme.** AG Grid draws the lines, the hover and selection, the focus and its popups in a theme the grid builds from the app theme. \`grid.services.get('gridTheme').hooks.theme\` changes it: AG Grid's themes cannot be edited, so set \`result.theme\` to a new one, usually with \`withParams\`. The grid reads it once, as it is created. \`hooks.styles\` adds styles to the grid's root element. What the grid builds from the app theme is on [**AG Grid**](?path=/docs/controls-grid-ag-grid--overview).

## Size the grid

Here the DatasetControl has no height, so the grid sizes itself: it grows with its rows, up to eight.

{{canvas: Size the grid}}

Without a \`height\`, the grid's rows area grows to \`maxVisibleRows\` × \`rowHeight\`, then scrolls; the header and the totals row come on top, and with no rows the area stays 135 px tall for the empty state. With a \`height\`, the grid is that tall and its rows scroll inside it; \`'100%'\` fills a parent that has a height of its own. The grid is never shorter than 220 px.

| Prop | Type | Default | Timing | Description |
|---|---|---|---|---|
| \`maxVisibleRows\` | \`number\` | \`15\` | Live | How many rows the grid grows to fit without a height |
| \`height\` | \`string\` | None | Live | The grid's height, as a CSS length |

Inside a DatasetControl that has a height, as in every other example of this guide, the grid fills the control's body whatever its own props say, as the DatasetControl guide's [**Lay it out**](?path=/docs/controls-datasetcontrol-guide-features-lay-it-out--overview) shows.

## Try it

- Scroll right to *Close date*: the three overdue open deals have red close dates, and *Alpine Ski House: Licence upgrade*, Anna Novak's deal in *Qualify*, has an amber one, due within a week.
- Set one of the overdue deals to *Won*: its close date loses its colour.
- *Stage* and *Recurring* are tags in their options' colours, and *Value* and *Discount (%)* have green headers.
- In **Code**, set \`rowHeight={52}\` and add \`enableZebra={false}\`: the rows are roomier, and none is shaded.
- In *Size the grid*, open *Stage*'s menu, pick **Filter By**, pick *Lost* and press **Apply**: the grid shrinks to the three lost deals.

## Remember

- Density, zebra rows and option colours are props, read at mount.
- A theme hook colours a cell or a header by its data.
- Without a height, the grid grows with its rows up to \`maxVisibleRows\`.

{{block: navigation}}
`

const meta = {
    title: 'Controls/Grid/Guide/Make it yours/Colours and density',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { progress: () => <GuideProgress current={STEP} />, navigation: () => <GuideNavigation current={STEP} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ColoursAndDensity: Story = {
    name: 'Colours and density',
    tags: ['!dev'],
    render: () => renderStory(<ColoursAndDensityExample />),
}

export const SizeTheGrid: Story = {
    name: 'Size the grid',
    tags: ['!dev'],
    render: () => renderStory(<SizeTheGridExample />),
}
