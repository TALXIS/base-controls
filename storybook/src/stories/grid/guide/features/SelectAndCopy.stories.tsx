import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../grid/guide/gridGuide'
import { SelectAndCopyExample } from '../../../../grid/guide/features/selectAndCopyExamples'

const STEP = 'Select and copy'

const DESCRIPTION = `
{{block: progress}}

The team ticks deals to act on them, and copies blocks of cells into a spreadsheet. This step adds row selection, cell selection and the clipboard to the grid, and the deal list's ribbon above it.

{{canvas: Select and copy}}

## How it works

This step adds three modules to the grid of [**Sort and filter**](?path=/docs/controls-grid-guide-basics-sort-and-filter--overview), and replaces its ribbon with the deal list's, in *DealsRibbon.tsx*. In **Code**, the new lines carry \`//new:\`.

**Row selection.** \`createRowSelectionModule({ mode: 'multiple' })\` adds a column of checkboxes, pinned first. With the editing module on, a row's save status is drawn in its checkbox cell.

| User action | What it does |
|---|---|
| Click a row | Selects the row and clears the others |
| Ctrl+click (Cmd+click on a Mac) | Adds the row to the selection, or takes it out |
| Shift+click | Selects every row from the last one selected to this one |
| Space | Selects the focused row, or takes it out |
| A row's checkbox | Adds the row, or takes it out, and leaves the others as they are |
| The header checkbox | Selects every row on the page; unticking it clears the selection |

With \`mode: 'single'\`, every click and every checkbox replaces the selection, and there is no header checkbox.

**The selection is the provider's.** \`provider.getSelectedRecordIds()\` reads it, \`provider.setSelectedRecordIds(ids)\` changes it, and the provider raises \`onRecordsSelected\` on every change; the grid follows (see *Selection* on [**Data providers**](?path=/docs/concepts-data-providers--overview)). **Mark N as won** in *DealsRibbon.tsx* reads the ticked deals from the provider this way; the ribbon is the DatasetControl guide's [**Act on deals**](?path=/docs/controls-datasetcontrol-guide-features-act-on-deals--overview). To refuse or change a selection, see [**Hooks**](?path=/docs/controls-grid-guide-advanced-hooks--overview).

**Cell ranges and the clipboard.** \`createCellSelectionModule()\` lets users highlight blocks of cells as in a spreadsheet, and \`createClipboardModule()\` copies them out and pastes into them:

| User action | What it does |
|---|---|
| Drag across cells | Highlights a block |
| Shift+click, Shift+arrow keys | Extends the block from the focused cell |
| Ctrl+drag | Adds another block |
| Ctrl+C (Cmd+C on a Mac) | Copies the highlighted blocks, or the focused cell |
| Ctrl+V | Pastes into the focused cell or the highlighted block |
| Ctrl+X | Copies the highlighted cells and clears them |
| Delete, Backspace | Clears the highlighted cells |

Values copy as the grid shows them, with a tab between cells and a line per row, so they paste into a spreadsheet as cells. Pasting, cutting and clearing need the editing module: each value reaches its record as if it was typed, read with its column's data type; locked cells are skipped, text a column cannot take leaves the cell as it was, and with auto-save each changed record saves once. The parameters of all three modules are under *Modules* on [**Reference**](?path=/docs/controls-grid-reference--overview).

**AG Grid Enterprise and the licence.** The grid runs on AG Grid Community. Cell selection, the clipboard, grouping and \`ServerSideGrid\` use AG Grid Enterprise, which needs a licence from AG Grid; its packages come with \`@talxis/base-controls\`. Pass your key to \`createLicenseModule({ key })\`, and leave the module out while there is no key, as the example does. One key licenses every grid on the page. Without one, AG Grid logs a licence message to the console and, on any host but \`localhost\` and \`127.0.0.1\`, draws a watermark over every grid on the page.

## Try it

- Tick the first two deals: the ribbon offers **Mark 2 as won**. Press it: both read *Won*, and the command goes once the CRM has saved them.
- Click a row, then Shift+click the row five below it: all six rows are selected.
- Drag from the first deal's *Deal* to the fourth deal's *Value*, press Ctrl+C and paste into a spreadsheet: the names, account managers, stages and values arrive as cells.
- Copy one deal's *Discount (%)*, highlight three other discounts and press Ctrl+V: all three take it, and **Save** appears.
- In **Code**, set \`mode: 'single'\`, then tick two deals: the second clears the first, and the header checkbox is gone.

## Remember

- The selection is the provider's: the grid and the ribbon read it from there.
- Values copy as the grid shows them, and paste as if they were typed.
- Cell selection, the clipboard, grouping and \`ServerSideGrid\` need AG Grid Enterprise, licensed with \`createLicenseModule\`.

{{block: navigation}}
`

const meta = {
    title: 'Controls/Grid/Guide/Features/Select and copy',
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

export const SelectAndCopy: Story = {
    name: 'Select and copy',
    tags: ['!dev'],
    render: () => renderStory(<SelectAndCopyExample />),
}
