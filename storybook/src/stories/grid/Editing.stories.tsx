import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { CheckHoursExample, FreezeApprovedExample, LogHoursExample, ReviewChangesExample, ServerRefusesExample, TickBillableExample } from '../../grid/examples/editingExamples'

const DESCRIPTION = `
Turn on \`enableEditing\` and users change values right in the grid. Each column is edited with its data type's own control, values are checked as they are entered, every save reports back on its row, and you decide what stays locked. Every example on this page is a team lead correcting last week's timesheets.

## Turn editing on

\`enableEditing\` (default \`false\`) opens the grid for editing. It is read at mount: to switch it, give the grid a new \`key\`. Each column is then editable unless its metadata has \`IsValidForUpdate: false\`; what the provider fills in when you leave it out is on [**Data**](?path=/docs/grid-get-started-data--overview). While editing is on, a double click opens the cell's editor rather than the record.

\`enableAutoSave\` (default \`false\`) saves a record each time one of its values is committed. It is read live, so you can switch it without a remount.

{{story: Log hours with auto-save}}

## How a value commits

A value reaches the record when the cell's control commits it:

| Control | Columns | Commits |
|---|---|---|
| Text input | Text, multiline text, email, phone, URL, whole and decimal numbers, currency, a typed duration | When the input loses focus or the editor closes |
| Picker that closes | Option set, two options, date only, a duration picked from its list | As soon as a value is picked; the editor closes |
| Picker that stays open | Date and time, multi-select option set, lookup | On every pick; the editor stays open until you leave the cell |

- Escape closes the editor and keeps what was typed. It is not an undo: \`record.clearChanges()\` is.
- Closing an editor without changing the value commits nothing.
- With \`enableAutoSave\`, each commit calls \`record.save()\` straight away. Saves are not batched, and a value that fails validation is sent to \`save()\` too, which refuses it.
- Only a value committed in a cell saves itself. \`record.setValue()\` from your own code changes the record and saves nothing.

## Saving

| Call | Saves | Fires |
|---|---|---|
| \`record.save()\` | One record. Auto-save calls it for you. | \`onBeforeRecordSaved(record)\`, then \`onAfterRecordSaved(result)\` |
| \`provider.save(records?)\` | The records you pass, or every record with unsaved changes. Without arguments it puts the provider into loading, so a slow save shows the grid's loading overlay. | Both of the above for each record, then \`onAfterSaved(results)\` |

- Each record's result is \`{ recordId, success, fields, errors? }\`; \`errors\` lists \`{ fieldName?, message }\`.
- \`onAfterSaved\` fires only for \`provider.save()\`. With auto-save alone, follow \`onAfterRecordSaved\`.
- \`onBeforeRecordSaved\` fires for every save, including one that validation then refuses.

Every event, and the order they fire in, is on [**Props and events**](?path=/docs/grid-get-started-props-and-events--overview).

{{story: Review changes, then save them all}}

### Unsaved changes

With auto-save off, edits stay on the records until you save or discard them, and the grid marks nothing as changed. Build what you need from the provider and its records:

| Call | Returns or does |
|---|---|
| \`provider.isDirty()\` | Whether any record has unsaved changes |
| \`provider.getDirtyRecordIds()\` | The ids of those records |
| \`provider.clearChanges()\` | Reverts every unsaved change; the cells show the old values again |
| \`provider.isValid()\`, \`provider.getInvalidRecordIds()\` | Whether the records you changed pass validation, and which do not |
| \`record.isDirty(columnName?)\` | Whether the record, or one of its columns, has unsaved changes |
| \`record.clearChanges()\` | Reverts one record |

\`onRecordValueChanged\` fires for every change to a value: from a cell, from \`record.setValue()\` and from \`clearChanges()\`. A successful save changes no value, so follow \`onAfterSaved\` as well to keep a save bar current.

## The save status

An editable grid adds a save status column, 40px wide and pinned at the start of each row, \`RECORD_SAVE_COLUMN_KEY\` (\`'recordSaveStatus'\`), where the row reports its last save, with or without auto-save:

- a spinner while the record saves;
- a green check for 2 seconds once it saved;
- a red icon once it was refused, until the user dismisses it or the record saves again. Clicking it opens a callout that lists each error under its column's header name.

With row selection on, the status is drawn in the row's checkbox cell instead: see [**Selection and clipboard**](?path=/docs/grid-modules-selection-and-clipboard--overview). The red icon lives only on screen: a row that scrolls out of view and back, or a grid that remounts, loses it. Hide the column with \`colDefs={{ [RECORD_SAVE_COLUMN_KEY]: { hide: true } }}\`, or replace its parts as shown on [**Custom Components**](?path=/docs/grid-appearance-custom-components--overview).

## Validation

A value that fails validation draws a red outline and an error icon in its cell, with the message in the icon's tooltip. \`record.save()\` then refuses the record without calling the provider: \`onAfterRecordSaved\` gets \`success: false\` with one error per invalid column, and the row's save status turns red.

{{story: Check hours as they are entered}}

| Source | Where it is set | What it checks |
|---|---|---|
| Required | \`metadata.RequiredLevel\` \`1\` (SystemRequired) or \`2\` (ApplicationRequired) on the provider column | That the value is not empty. The header shows an asterisk while \`enableEditing\` is on. |
| Built-in checks | The column's data type and metadata | Single-line text against \`MaxLength\`, whole and decimal numbers against \`MinValue\` and \`MaxValue\`, that numbers, money and durations hold numbers, email, URL and date formats |
| One column | \`settings.cell.onGetValidation(result, { record })\` in \`colDefs\` | Your rule for that column. It may read any column of the record. |
| Every column | \`registerValidationHook(hook, priority?)\` on the \`validation\` service, from a module | Your rule for every column of every record. See [**Hooks**](?path=/docs/grid-extending-hooks--overview). |

- Your rules run first: the hooks, then the column's \`onGetValidation\`, then the required and built-in checks. A rule can add an error; it cannot clear a built-in one.
- Validation does not depend on editing: a read-only grid outlines invalid values too.
- \`settings.isRequired\` only draws the asterisk; it validates nothing. \`record.expressions.setRequiredLevelExpression\` changes the required check for one record, not the asterisk.
- Your rules are set on the provider's records, so they gate every save, a \`provider.save()\` from outside the grid included. They replace a \`record.expressions.setValidationExpression\` of your own on the same column.
- Your rules run for group rows and the totals row as well: see [**Grouping and totals**](?path=/docs/grid-modules-grouping-and-totals--overview).

## When the server refuses

A server can refuse a save the browser allowed. A provider reports that as \`{ success: false, errors: [{ fieldName, message }] }\`. To change how records are saved, or to stand in for a server as below, use \`provider.setInterceptor('onRecordSave', (record, defaultAction) => ...)\` and resolve the same shape.

{{story: When the server says no}}

- \`fieldName\` is the column's logical name; the callout shows its header name. Leave it out for an error about the whole record.
- Resolve a refusal; never throw or reject. A save that rejects leaves the row's spinner running and fires no \`onAfterRecordSaved\`.
- A refused record keeps its values and stays unsaved, ready to be saved again.
- Errors from the server appear only in the callout. A cell outlines only what fails validation in the browser.
- A provider holds one interceptor per name: a second \`setInterceptor('onRecordSave', ...)\` replaces the first.
- The callout's title and button are the \`recordSaveErrorTitle\` (\`Your changes were not saved\`) and \`recordSaveErrorDismiss\` (\`Dismiss\`) labels. Every label is listed on [**Appearance**](?path=/docs/grid-appearance--overview).

## Locks

Locks decide what can be edited. There are four levels, checked in the order of the table below. The first level that locks wins, and only its mark is drawn: a cell in a locked column or row shows no lock of its own.

{{story: Freeze approved entries}}

| Level | Locked by | Drawn as | Label |
|---|---|---|---|
| Grid | \`enableEditing\` off | Nothing: no save status column, no lock icons, no muted rows | None |
| Column | \`settings.isLocked: true\`, which a column starts with when its metadata has \`IsValidForUpdate: false\`; or a lock hook asked about \`{ columnName }\` | A lock in the header | \`columnLocked\`: This column cannot be edited. |
| Record | \`rowSettings.onGetLock\`, a lock hook asked about \`{ record }\`, or a record the provider reports inactive | A muted row, and a lock in a column pinned at the start of the row | \`recordLocked\`: This record cannot be edited. |
| Cell | \`settings.cell.onGetLock\` in \`colDefs\`, or a lock hook asked about \`{ record, columnName }\` | A lock icon in the cell | \`valueLocked\`: This value cannot be edited. |

- \`settings.isLocked: true\` is final: no hook reopens the column. To open a column its metadata locks, give it \`settings: { isLocked: false }\` in \`colDefs\` (with the legacy client API module on, see [**Legacy client API**](?path=/docs/grid-modules-legacy-client-api--overview)).
- \`rowSettings.onGetLock(result, { record })\` runs after the record-level lock hooks, with \`result.isLocked\` starting as \`!record.isActive()\`. It has the last word, so it can also unlock.
- \`settings.cell.onGetLock(result, { record })\` runs after the cell-level lock hooks, and only for a cell whose grid, column and record are open.
- Both run every time the grid asks, which is often: keep them fast and free of side effects.
- A lock that reads something outside its record, such as a toggle or the user's role, redraws nothing by itself: redraw the cells and headers (see *Redrawing* on [**Extending**](?path=/docs/grid-extending--overview)). A muted row only follows once a value of its record changes or the data reloads.
- The lock column is \`RECORD_LOCK_COLUMN_KEY\` (\`'recordLock'\`); it is hidden until a loaded row is locked. A muted row carries the class \`LOCKED_RECORD_ROW_CLASS\`.
- A module locks columns, records and cells with \`registerLockHook\` on the \`locks\` service: see [**Hooks**](?path=/docs/grid-extending-hooks--overview).

### Inactive records

A record the provider reports inactive (\`record.isActive()\` is \`false\`) starts out locked. The memory, FetchXml and Power Apps dataset providers report every record active, so lock inactive records yourself, for example from Dataverse's \`statecode\`:

\`\`\`tsx
const INACTIVE = 1

const rowSettings: IGridRowSettings = {
    onGetLock: (result, { record }) => {
        if (Number(record.getValue('statecode')) === INACTIVE) {
            result.isLocked = true
        }
    },
}
\`\`\`

### What locks do not do

- Locks gate only the grid's own editing: whether an editor opens, and whether an in-place control is enabled. \`record.setValue()\` from your code ignores every lock, and never saves by itself.
- A lock does not switch validation off: an invalid value in a locked cell is still outlined, and still refuses the save.
- \`record.expressions.setDisabledExpression\` locks a cell only while the legacy client API module is on: see [**Legacy client API**](?path=/docs/grid-modules-legacy-client-api--overview).

## Edit in place

\`settings.cell.oneClickEdit\` draws the column's editing control in the cell itself, so no editor opens: a two-options column becomes a switch you click, or a coloured option picker while \`enableOptionSetColors\` is on and its options have colours. With the cell focused, F2 or typing a character steps into its control, and Escape steps out. A locked cell, and every cell while editing is off, draws its control disabled. A column the provider marks \`oneClickEdit: true\` starts with it on, and grouping turns it off on the columns it groups by.

{{story: Tick billable in place}}

## Keyboard

| Key | On a focused cell | While editing |
|---|---|---|
| F2, or typing a character | Opens the editor; on an in-place cell, steps into its control | |
| Enter | Moves down a row | Commits and moves down a row |
| Shift+Enter | Moves up a row | Commits and moves up a row |
| Escape | | Closes the editor and keeps what was typed; on an in-place cell, steps out |
| Space | Selects the row while row selection is on; never opens an editor | Types a space |
`

const meta = {
    title: 'Grid/Editing',
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

export const LogHoursWithAutoSave: Story = {
    name: 'Log hours with auto-save',
    render: () => renderStory(<LogHoursExample />),
    parameters: {
        docs: {
            description: {
                story: `Correct an entry's hours and it saves as you leave the cell: \`enableEditing\` with \`enableAutoSave\`, and a status line fed by \`onBeforeRecordSaved\` and \`onAfterRecordSaved\`. Watch the column at the start of the row: a spinner while the entry saves (the docs provider answers after a moment, as a server would), then a check for two seconds.`,
            },
        },
    },
}

export const ReviewChangesThenSaveThemAll: Story = {
    name: 'Review changes, then save them all',
    render: () => renderStory(<ReviewChangesExample />),
    parameters: {
        docs: {
            description: {
                story: `Auto-save is off, so corrections wait for a command bar built on \`provider.getDirtyRecordIds()\`, \`provider.save()\` and \`provider.clearChanges()\`, kept current by \`onRecordValueChanged\` and \`onAfterSaved\`. Change two entries, then press Discard to see them go back, or Save to see each row report its save.`,
            },
        },
    },
}

export const CheckHoursAsTheyAreEntered: Story = {
    name: 'Check hours as they are entered',
    render: () => renderStory(<CheckHoursExample />),
    parameters: {
        docs: {
            description: {
                story: `Hours must lie between 0.25 and 12 and a rejected entry needs a comment, both checked by \`settings.cell.onGetValidation\`; Work done is required through its column's \`metadata.RequiredLevel\`, so its header shows an asterisk. Enter 14 hours, empty a Work done cell, or reject a Submitted entry that has no comment: the offending cell turns red, the save is refused, and the red icon at the start of the row says why.`,
            },
        },
    },
}

export const WhenTheServerSaysNo: Story = {
    name: 'When the server says no',
    render: () => renderStory(<ServerRefusesExample />),
    parameters: {
        docs: {
            description: {
                story: `A payroll server, stood in for by \`provider.setInterceptor('onRecordSave')\`, refuses entries dated before last week's Wednesday and days of more than 8 hours for one employee by resolving \`{ success: false, errors }\`. Change an entry from Monday (the first five rows), or raise Anna Novak's Thursday workshop from 7.5 to 8.5 hours, then click the red icon at the start of the row.`,
            },
        },
    },
}

export const FreezeApprovedEntries: Story = {
    name: 'Freeze approved entries',
    render: () => renderStory(<FreezeApprovedExample />),
    parameters: {
        docs: {
            description: {
                story: `Approved entries are locked as a whole by \`rowSettings.onGetLock\`, Hourly rate is locked by \`settings.cell.onGetLock\` wherever the work is not billable, and Employee is locked for good by \`settings.isLocked\`, each with its own tooltip from \`labels\`. Hover the locks, approve a Submitted entry to watch it freeze, then close the week to remount the grid with \`enableEditing\` off.`,
            },
        },
    },
}

export const TickBillableInPlace: Story = {
    name: 'Tick billable in place',
    render: () => renderStory(<TickBillableExample />),
    parameters: {
        docs: {
            description: {
                story: `Billable is a switch right in its cell through \`settings.cell.oneClickEdit\`: one click changes it and auto-save saves it, with no editor in between. Switch a billable entry off and watch the amount to invoice drop.`,
            },
        },
    },
}
