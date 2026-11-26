import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../grid/guide/gridGuide'
import { RulesOnCellsExample, RulesOnRowsExample } from '../../../../grid/guide/advanced/hooksExamples'

const STEP = 'Hooks'

const DESCRIPTION = `
{{block: progress}}

The CRM's rules come into the grid: discounts, forecasts, empty dates, big deals and closed deals. This step adds a hook for each, first on the cells, then on the rows, and tells the grid to draw again when what a hook reads changes.

{{canvas: Rules on cells}}

## How it works

Like [**From your code**](?path=/docs/controls-grid-guide-advanced-from-your-code--overview), this step starts from *the deal grid*. In **Code**, the new lines carry \`//new:\`. What a hook is, and how \`add\` and \`priority\` work, is on [**Lock closed deals**](?path=/docs/controls-grid-guide-features-lock-closed-deals--overview).

**When hooks run.** The grid runs a hook each time it draws what the hook decides: a cell hook as the cell draws, a row hook as AG Grid lays the row out, a header hook as the header draws. Keep a hook fast and free of side effects. Hooks run for group rows and the totals row too, where \`getValue()\` reads \`null\`, as on [**Group and total**](?path=/docs/controls-grid-guide-features-group-and-total--overview).

**Validation.** \`hooks.validation\` on the \`validation\` service gets \`(result, { record, columnName })\` for every column of every record, and sets \`result.error\` and \`result.errorMessage\`. The hooks run first; the required and built-in checks of [**Check what users enter**](?path=/docs/controls-grid-guide-basics-check-what-users-enter--overview) run only while the hooks find no error. An error shows in the cell and refuses the record's save, as theirs do. Once a validation hook is added, the grid sets the validation of every column of every record, which replaces any your code set with \`record.expressions.setValidationExpression\`.

**Cell hooks.** The \`cells\` service has a hook for each thing a cell decides:

| Hook on \`cells.hooks\` | Gets | Decides |
|---|---|---|
| \`loading\` | \`(result, { record, columnName })\` | \`result.isLoading\`: a shimmer in place of the value |
| \`control\` | \`(result, { record, columnName, takesInput })\` | \`result.control\`: the control that draws or edits the cell, by \`name\`, and the \`parameters\` it is handed, such as \`Placeholder\`. \`takesInput\` is \`true\` for an editor and for a cell edited in place. |
| \`theme\`, \`commands\` | | See [**Colours and density**](?path=/docs/controls-grid-guide-make-it-yours-colours-and-density--overview) and [**Cells and headers of your own**](?path=/docs/controls-grid-guide-make-it-yours-cells-and-headers-of-your-own--overview) |

The parameters a cell's control reads are under *Columns* on [**Reference**](?path=/docs/controls-grid-reference--overview).

**Filters and menus.** \`hooks.filterControlParameters\` on the filtering module gets \`(result, { column, control, index })\` and changes the parameters of the filter callout's controls, such as a text box's \`Placeholder\`: \`control\` is \`'operator'\` or \`'value'\`, and \`index\` is \`1\` for the second value of *Between*. \`columns.headers.hooks.menuItems\` runs once a column's menu is laid out and gets every item, each section's heading keyed \`'<section key>Header'\`, to move or remove what a section cannot. Every hook, and what it decides, is under *Hooks* on Reference.

### Redrawing

A record's new value draws that record's cells again by itself, as a forecast probability ends the shimmer. When anything else a hook reads changes, such as the \`forecasting\` set, a toggle or other records, tell the grid to draw again:

| What changed | When the grid runs the hooks | Call |
|---|---|---|
| A cell's colours, loading, commands, control, parameters, lock or validation | Each time the cell draws | \`cells.render()\`, \`cells.render({ columnNames })\`, or \`render()\` on one cell from \`cells.getCell(record, columnName)\` |
| A row's lock | For its cells, each time they draw; for the dimmed row and the lock column, when the record's values change and on every load | \`cells.render()\` for the cells, \`provider.refresh()\` for the dimmed row |
| A column's lock | When the grid builds its columns: once it is ready, and on every load | \`provider.refresh()\` |
| A row class rule | When AG Grid updates the row | \`rows.refreshRowClasses(records)\` |
| A header's adornments or colours | Each time the header draws | \`columns.headers.render()\` |
| A column's menu | Each time it opens | Nothing |
| A row's height | When AG Grid lays the row out | \`resetRowHeights()\` on the \`gridApi\` service |
| The column definitions | When the grid is ready, then on every load | \`provider.refresh()\` |
| AG Grid's options | When AG Grid is ready, on every load, and on \`refreshAgGridOptions()\` | \`grid.refreshAgGridOptions()\` |
| AG Grid's initial options, the AG Grid theme, the grid's styles | Once, as the grid mounts | A new \`key\` on the grid |

\`cells.getCell\` finds only cells on screen; a cell that scrolls into view draws with the current results anyway.

## Rules on rows

This example adds a row hook and a selection hook to *the deal grid*.

{{canvas: Rules on rows}}

\`hooks.height\` on the \`rows\` service sets \`result.height\` in pixels; left unset, a row keeps the grid's \`rowHeight\`, and a height the user drags on a row's grip wins over the hooks. AG Grid asks for a row's height only as it lays the row out, so the example calls \`resetRowHeights()\` on the \`gridApi\` service when a *Value* changes. A class on rows comes from \`rows.addRowClass(className, rule)\`, which is not a hook: see *Hooks* on Reference.

\`hooks.selectRecords\` on the row selection module runs before a selection is written to the provider, from a click, a checkbox, the header checkbox or \`selectRecords\`. Change \`selection.recordIds\` to select something else, as the example drops won and lost deals, or set \`selection.isCancelled\` to refuse it. Hooks may be async, and each is awaited before the next; unticking the header checkbox, and your own calls on the provider, skip them. \`hooks.selectionState\` changes how a row's checkbox reads: \`result.state\` is \`'checked'\`, \`'unchecked'\` or \`'indeterminate'\`.

## Try it

- Set the *Discount (%)* of a *Propose* deal to 15: an error icon shows, with *A discount over 10% is for deals in negotiation.* Set its *Stage* to *Negotiate*: the error goes.
- The five deals without a close date read *Not planned yet*.
- Press **Forecast**: the *Probability (%)* of each open deal shimmers until its new value arrives, and **Save** appears.
- In *Rules on rows*, tick the header checkbox: every open deal is ticked, none of the 10 won or lost, and the ribbon offers **Mark 20 as won**.
- The three deals of $31,500 are taller. Set another deal's *Value* to 30000: its row grows.

## Remember

- Hooks run as the grid draws, so keep them fast and free of side effects.
- A new value draws its record's cells again; when anything else a hook reads changes, tell the grid to draw again.
- Every hook is under *Hooks* on Reference.

{{block: navigation}}
`

const meta = {
    title: 'Controls/Grid/Guide/Advanced/Hooks',
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

export const RulesOnCells: Story = {
    name: 'Rules on cells',
    tags: ['!dev'],
    render: () => renderStory(<RulesOnCellsExample />),
}

export const RulesOnRows: Story = {
    name: 'Rules on rows',
    tags: ['!dev'],
    render: () => renderStory(<RulesOnRowsExample />),
}
