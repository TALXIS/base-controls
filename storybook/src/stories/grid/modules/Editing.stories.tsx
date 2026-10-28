import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { SaveStatusExample } from '../../../grid/examples/customComponentsExamples'
import { CheckHoursExample, FreezeApprovedExample, LogHoursExample, ReviewChangesExample, ServerRefusesExample, TickBillableExample } from '../../../grid/examples/editingExamples'

const DESCRIPTION = `
Without the editing module the grid is read-only. With it, each column is edited with its data type's own control, values are checked as they are entered, every save reports back on its row, and you decide what stays locked.

\`\`\`tsx
<DatasetControl onLoad={loadTimesheet}>
    <DatasetControl.Body>
        <Grid modules={[createClientSideRowModelModule(), createEditingModule({ autoSave: true })]} />
    </DatasetControl.Body>
</DatasetControl>
\`\`\`

{{story: Log hours with auto-save}}

## Turn editing on

| Option | Type | Default | Description |
|---|---|---|---|
| \`autoSave\` | \`boolean\` | \`false\` | Saves a record each time one of its values is committed. |
| \`onEditedCellChanged\` | \`(previous?, next?) => void\` | None | An editor opens or closes, or the user steps into or out of an in-place cell. Each argument is \`{ recordId, columnName }\`. |

- Every column is editable unless its metadata has \`IsValidForUpdate: false\`: see [**Data**](?path=/docs/grid-data--overview). File, image and ribbon columns never open an editor.
- While editing is on, a double-click opens the cell's editor rather than the record.
- The module and its options are read at mount: see *Change a prop that is read at mount* on [**Props and events**](?path=/docs/grid-props-and-events--overview).

## How a value commits

A value reaches the record when the cell's control commits it:

| Control | Columns | Commits |
|---|---|---|
| Text input | Text, multiline text, email, phone, URL, whole and decimal numbers, currency, a typed duration | When the input loses focus or the editor closes |
| Picker that closes | Option set, two options, date only, a duration picked from its list | As soon as a value is picked; the editor closes |
| Picker that stays open | Date and time, multi-select option set, lookup | On every pick; the editor stays open until you leave the cell |

- Esc closes the editor and keeps what was typed. It is not an undo: \`record.clearChanges()\` is.
- Closing an editor without changing the value commits nothing.
- A paste, a cut or a fill handle drag writes text into each cell, parsed with the column's data type. Text that does not parse leaves the cell as it was. With \`autoSave\`, each record saves once, after all its cells are written.

## Save

With \`autoSave\`, each commit calls \`record.save()\` straight away. Without it, edits stay on the records until you call \`provider.save()\` or \`provider.clearChanges()\`, and the grid marks nothing as changed: build your save bar from the provider. The calls, the save result and the unsaved-changes methods are under *Edit and save* on [**Data providers**](?path=/docs/data-providers--overview).

{{story: Review changes, then save them all}}

- \`onAfterSaved\` fires only for \`provider.save()\`. With auto-save alone, follow \`onAfterRecordSaved\`.
- \`onRecordValueChanged\` fires for every change to a value, \`clearChanges()\` included. A successful save changes no value, so follow \`onAfterSaved\` as well to keep a save bar current.

### The save status

An editable grid adds a save status column, \`RECORD_SAVE_COLUMN_KEY\`, pinned at the start of each row. It reports the row's last save, with or without auto-save: a spinner while the record saves, a green check for 2 seconds once it saved, and a red icon once it was refused. Clicking the red icon lists each error under its column's name.

- With row selection on, the status is drawn in the row's checkbox cell instead.
- The red icon lives only on screen: a row that scrolls out of view and back, or a grid that remounts, loses it.
- Hide the column with \`colDefs={{ [RECORD_SAVE_COLUMN_KEY]: { hide: true } }}\`, or draw it your own way: see *Changing how it looks* below.

## Validation

A value that fails validation draws a red outline and an error icon in its cell, with the message in the icon's tooltip. \`record.save()\` then refuses the record without calling the provider, and the row's save status turns red.

{{story: Check hours as they are entered}}

| Source | Where it is set | Description |
|---|---|---|
| Required | \`metadata.RequiredLevel\` \`1\` (SystemRequired) or \`2\` (ApplicationRequired) on the provider column | The value is not empty. The header shows an asterisk while the editing module is on. |
| Built-in checks | The column's data type and metadata | Single-line text against \`MaxLength\`, numbers against \`MinValue\` and \`MaxValue\`, that numbers, money and durations hold numbers, email, URL and date formats. |
| One column | \`context.cell.onGetValidation(result, { record })\` in \`colDefs\` | Your rule for that column. It may read any column of the record. |
| Every column | \`registerValidation(hook, priority?)\` on the \`validation\` service | Your rule for every column of every record. See *Validation* on [**Hooks**](?path=/docs/grid-extending-hooks--overview). |

- Your rules run first, then the required and built-in checks. A rule can add an error; it cannot clear a built-in one.
- Validation does not depend on editing: a read-only grid outlines invalid values too.
- \`context.isRequired\` only draws the asterisk. \`record.expressions.setRequiredLevelExpression\` changes the required check for one record, not the asterisk.
- Your rules are set on the provider's records, so they gate every save, a \`provider.save()\` from outside the grid included. They replace a \`record.expressions.setValidationExpression\` of your own on the same column.

## Edit in place

\`context.cell.oneClickEdit: true\` in \`colDefs\` draws the column's editing control in the cell itself, so no editor opens: a two-options column becomes a switch you click, an option set a coloured picker while \`enableOptionSetColors\` is on.

{{story: Tick billable in place}}

- With the cell focused, F2 or typing a character steps into its control, and Esc steps out.
- A locked cell, and every cell while editing is off, draws its control disabled.
- Grouping turns it off on the columns it groups by.

## Locks

Locks decide what can be edited. There are four levels, checked in the order of the table below. The first level that locks wins, and only its mark is drawn: a cell in a locked column or row shows no lock of its own. The tooltips are the labels in the last column: see [**Localization**](?path=/docs/grid-localization--overview).

{{story: Freeze approved entries}}

| Level | Locked by | Drawn as | Label |
|---|---|---|---|
| Grid | No editing module | Nothing: no save status column, no lock icons, no dimmed rows | None |
| Column | \`context.isLocked: true\`, which a column starts with when its metadata has \`IsValidForUpdate: false\`; or a lock hook asked about \`{ columnName }\` | A lock in the header | \`columnLocked\` |
| Record | \`rowSettings.onGetLock\`, a lock hook asked about \`{ record }\`, or an inactive record | A dimmed row, and a lock in a column pinned at the start of the row | \`recordLocked\` |
| Cell | \`context.cell.onGetLock\` in \`colDefs\`, or a lock hook asked about \`{ record, columnName }\` | A lock icon in the cell | \`valueLocked\` |

- \`context.isLocked: true\` is final: no hook reopens the column. To open a column its metadata locks, give it \`context: { isLocked: false }\` in \`colDefs\`.
- \`rowSettings.onGetLock(result, { record })\` runs after the record-level lock hooks, with \`result.isLocked\` starting as \`!record.isActive()\`, so it can also unlock.
- \`context.cell.onGetLock(result, { record })\` runs after the cell-level lock hooks, and only for a cell whose column and record are open.
- A lock that reads something outside its record, such as a toggle or the user's role, redraws nothing by itself: see *Redrawing* on [**Talking to the grid**](?path=/docs/grid-talking-to-the-grid--overview).
- The lock column is \`RECORD_LOCK_COLUMN_KEY\`, hidden until a loaded row is locked. A dimmed row carries the class \`LOCKED_RECORD_ROW_CLASS\`.
- A module locks with \`editing.locks.registerLock\`: see *Locks* on [**Hooks**](?path=/docs/grid-extending-hooks--overview).

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

- Locks gate only the grid's own editing: whether an editor opens, and whether an in-place control is enabled. \`record.setValue()\` from your code ignores every lock.
- A lock does not switch validation off: an invalid value in a locked cell is still outlined, and still refuses the save.
- \`record.expressions.setDisabledExpression\` locks a cell only while the legacy client API module is on: see [**Legacy client API**](?path=/docs/grid-modules-legacy-client-api--overview).

## When the server refuses

A server can refuse a save the browser allowed. A provider reports that as \`{ success: false, errors: [{ fieldName, message }] }\`, and the row's save status turns red with the errors in its callout. How a provider saves to your server is under *Your own provider* on [**Data providers**](?path=/docs/data-providers--overview).

{{story: Refuse a save on the server}}

- \`fieldName\` is the column's logical name; the callout shows its header name. Leave it out for an error about the whole record.
- Resolve a refusal rather than throwing. A save that throws or rejects is reported as a failed save, with the error's message in the callout.
- A refused record keeps its values and stays unsaved, ready to be saved again.
- Errors from the server appear only in the callout. A cell outlines only what fails validation in the browser.
- The callout's title and button are the \`recordSaveErrorTitle\` and \`recordSaveErrorDismiss\` labels: see [**Localization**](?path=/docs/grid-localization--overview).

## Keyboard

| Key | On a focused cell | While editing |
|---|---|---|
| F2, or typing a character | Opens the editor; on an in-place cell, steps into its control | Types |
| Enter | Moves down a row | Commits and moves down a row |
| Shift+Enter | Moves up a row | Commits and moves up a row |
| Esc | Nothing | Closes the editor and keeps what was typed; on an in-place cell, steps out |
| Space | Selects the row while row selection is on | Types a space |

## From your code

The editing module's instance is \`grid.modules.find('editing')\`, or \`useGridModule('editing')\` in a part the grid draws. Without the module, \`find\` returns \`undefined\` and \`useGridModule\` throws.

| Member | Description |
|---|---|
| \`isEditing(record, columnName)\` | Whether the user is editing that cell, in place or in an editor. |
| \`isAutoSaveEnabled()\` | Whether each commit saves its record. |
| \`locks.registerLock(hook, priority?)\` | Locks columns, records and cells. See *Locks* on [**Hooks**](?path=/docs/grid-extending-hooks--overview). |
| \`locks.get({ record?, columnName? })\` | Whether a column, a record's row or a cell is locked: \`{ isLocked, lockedBy? }\`. |
| \`events\` | \`onEditedCellChanged(previous, next)\`, as the module option. |

To change a value as a cell would, saving it with \`autoSave\`, go through its field: \`grid.services.get('fields').get(record, columnName).setValue(value)\`. \`record.setValue()\` changes the record and saves nothing.

## Changing how it looks

The editing module adds two columns of its own: the save status, keyed \`RECORD_SAVE_COLUMN_KEY\`, and the lock of a record locked as a whole, keyed \`RECORD_LOCK_COLUMN_KEY\`. To draw either your own way, set its \`cellRenderer\` in \`colDefs\` to the module's cell with \`components\`:

\`\`\`tsx
const SaveStatusCell = (props: IGridCellParams) => <RecordSaveIndicatorCell {...props} components={SAVE_STATUS} />

<Grid
    modules={[createClientSideRowModelModule(), createEditingModule({ autoSave: true })]}
    colDefs={{ [RECORD_SAVE_COLUMN_KEY]: { cellRenderer: SaveStatusCell } }} />
\`\`\`

| Cell | Key | Parts | Description |
|---|---|---|---|
| \`RecordSaveIndicatorCell\` | \`container\` | \`onRenderContainer\` | The cell the save status is drawn in. |
| \`RecordSaveIndicatorCell\` | \`indicator\` | \`onRenderContainer\`, \`onRenderSpinner\`, \`onRenderButton\`, \`onRenderErrorCallout\` | The status: a spinner while saving, then a button. |
| \`RecordSaveIndicatorCell\` | \`errorCallout\` | \`onRenderCallout\`, \`onRenderHeader\`, \`onRenderIcon\`, \`onRenderTitle\`, \`onRenderFields\`, \`onRenderField\` | The callout a failed save opens. |
| \`RecordLockIndicatorCell\` | \`container\` | \`onRenderContainer\` | The cell the lock is drawn in. |
| \`RecordLockIndicatorCell\` | \`lockIcon\` | \`onRenderTooltip\`, \`onRenderIcon\` | The lock. |

- With row selection on, the save status is drawn in the checkbox column by \`RecordSaveSelectionCell\`, which also takes \`checkbox\`. Set it on \`SELECTION_COLUMN_KEY\`.
- The parts follow the \`components\` rules: see *Replace what the grid draws* on [**Appearance**](?path=/docs/grid-appearance--overview).

{{story: Draw the save status your way}}
`

const meta = {
    title: 'Grid/Modules/Editing',
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
                story: `A timesheet that saves each entry as you leave the cell, with a status line fed by \`onBeforeRecordSaved\` and \`onAfterRecordSaved\`. Try: change an entry's hours and watch the start of its row; a spinner while it saves, then a check.`,
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
                story: `Corrections wait for the ribbon, built on \`provider.getDirtyRecordIds()\`, \`provider.save()\` and \`provider.clearChanges()\`, and refreshed on \`onRecordValueChanged\` and \`onAfterSaved\`. Try: change two entries, then press *Discard* or *Save*.`,
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
                story: `Hours must lie between 0.25 and 12 and a rejected entry needs a comment, both checked by \`context.cell.onGetValidation\`; Work done is required through \`metadata.RequiredLevel\`. Try: enter 14 hours or empty a Work done cell.`,
            },
        },
    },
}

export const WhenTheServerSaysNo: Story = {
    name: 'Refuse a save on the server',
    render: () => renderStory(<ServerRefusesExample />),
    parameters: {
        docs: {
            description: {
                story: `A payroll server, simulated with \`provider.setInterceptor('onRecordSave')\`, refuses entries dated before last week's Wednesday by resolving \`{ success: false, errors }\`. Try: change an entry from Monday (the first five rows), then click the red icon at the start of its row.`,
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
                story: `Approved entries are locked by \`rowSettings.onGetLock\`, Hourly rate by \`context.cell.onGetLock\` wherever the work is not billable, and Employee for good by \`context.isLocked\`. Try: approve a Submitted entry, then close the week to remount the grid without the editing module.`,
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
                story: `Billable is a switch in its cell through \`context.cell.oneClickEdit\`, saved by auto-save with no editor in between. Try: switch a billable entry off and watch the amount to invoice drop.`,
            },
        },
    },
}

export const SaveStatusYourWay: Story = {
    name: 'Draw the save status your way',
    render: () => renderStory(<SaveStatusExample />),
    parameters: {
        docs: {
            description: {
                story: `The save column's \`cellRenderer\` is \`RecordSaveIndicatorCell\` with \`indicator\` and \`errorCallout\` replaced: a labelled button, and the product's name in the failed-save callout. Try: set a price above 1,000.`,
            },
        },
    },
}
