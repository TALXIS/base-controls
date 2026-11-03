import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { CheckHoursExample, FreezeApprovedExample, LogHoursExample, ReviewChangesExample, SaveStatusExample, ServerRefusesExample, TickBillableExample } from '../../../grid/examples/editingExamples'

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

Every column can be edited unless its metadata sets \`IsValidForUpdate: false\` (see [**Data**](?path=/docs/controls-grid-data--overview)); file, image and ribbon columns never open an editor. While the module is on, a double-click opens the cell's editor rather than the record.

## How a value commits

A value reaches the record when the cell's control commits it:

| Control | Columns | Commits |
|---|---|---|
| Text input | Text, multiline text, email, phone, URL, whole and decimal numbers, currency, a typed duration | When the input loses focus or the editor closes |
| Picker that closes | Option set, two options, date only, a duration picked from its list | As soon as a value is picked; the editor closes |
| Picker that stays open | Date and time, multi-select option set, lookup | On every pick; the editor stays open until you leave the cell |

Esc closes the editor and keeps what was typed; \`record.clearChanges()\` is the undo. Closing an editor without changing the value commits nothing. A paste, a cut or a fill writes text into each cell, parsed with the column's data type, and text that does not parse leaves the cell as it was. With \`autoSave\`, each record saves once after all its cells are written.

## Save

With \`autoSave\`, each commit calls \`record.save()\` straight away. Without it, edits stay on the records until you call \`provider.save()\` or \`provider.clearChanges()\`, and the grid marks nothing as changed, so build your save bar from the provider. The calls and the save result are under *Edit and save* on [**Data providers**](?path=/docs/concepts-data-providers--overview).

{{story: Review changes, then save them all}}

\`onAfterSaved\` fires only for \`provider.save()\`; with auto-save alone, follow \`onAfterRecordSaved\`. \`onRecordValueChanged\` fires for every change to a value, \`clearChanges()\` included, but a successful save changes no value, so a save bar follows \`onAfterSaved\` as well.

### The save status

An editable grid adds a save status column, \`RECORD_SAVE_COLUMN_KEY\`, pinned at the start of each row. It shows a spinner while the record saves, a green check for two seconds once it saved, and a red icon once it was refused; clicking the red icon lists each error under its column's name. With row selection on, the status is drawn in the row's checkbox cell instead. The red icon lives only on screen: a row that scrolls out of view and back, or a grid that remounts, loses it. To hide the column, pass \`colDefs={{ [RECORD_SAVE_COLUMN_KEY]: { hide: true } }}\`.

## Validation

A value that fails validation draws a red outline and an error icon in its cell, with the message in the icon's tooltip. \`record.save()\` then refuses the record without calling the provider, and the row's save status turns red.

{{story: Check hours as they are entered}}

| Source | Where it is set | Checks |
|---|---|---|
| Required | \`metadata.RequiredLevel\` \`1\` (SystemRequired) or \`2\` (ApplicationRequired) on the provider column | The value is not empty. The header shows an asterisk while the editing module is on. |
| Built-in | The column's data type and metadata | Single-line text against \`MaxLength\`, numbers against \`MinValue\` and \`MaxValue\`, numbers, money and durations hold numbers, email, URL and date formats |
| One column | \`context.cell.onGetValidation(result, { record })\` in \`colDefs\` | Your rule for that column; it may read any column of the record |
| Every column | \`registerValidation(hook, priority?)\` on the \`validation\` service | Your rule for every column. See *Validation* on [**Hooks**](?path=/docs/controls-grid-extending-hooks--overview). |

Your rules run first, then the required and built-in checks; a rule can add an error but not clear a built-in one. Validation does not depend on editing, so a read-only grid outlines invalid values too. The rules are set on the provider's records, so they gate every save, a \`provider.save()\` from outside the grid included, and they replace a \`record.expressions.setValidationExpression\` of your own on the same column. \`context.isRequired\` only draws the asterisk.

## Edit in place

\`context.cell.oneClickEdit: true\` in \`colDefs\` draws the column's editing control in the cell itself, so no editor opens: a two-options column becomes a switch you click, an option set a coloured picker while \`enableOptionSetColors\` is on.

{{story: Tick billable in place}}

With the cell focused, F2 or typing a character steps into its control and Esc steps out. A locked cell, and every cell while editing is off, draws its control disabled. Grouping turns it off on the columns it groups by.

## Locks

Locks decide what can be edited. The levels are checked in the order of the table, and the first that locks wins: only its mark is drawn, so a cell in a locked column or row shows no lock of its own.

{{story: Freeze approved entries}}

| Level | Locked by | Drawn as | Tooltip label |
|---|---|---|---|
| Grid | No editing module | Nothing: no save status, no lock icons, no dimmed rows | None |
| Column | \`context.isLocked\`, which defaults to \`!metadata.IsValidForUpdate\`; or a lock hook asked about \`{ columnName }\` | A lock in the header | \`grid.columnLocked\` |
| Record | \`rowSettings.onGetLock\`, a lock hook asked about \`{ record }\`, or an inactive record | A dimmed row, and a lock in a column pinned at the start of the row | \`grid.recordLocked\` |
| Cell | \`context.cell.onGetLock\` in \`colDefs\`, or a lock hook asked about \`{ record, columnName }\` | A lock icon in the cell | \`grid.valueLocked\` |

To change the tooltips, see [**Localization**](?path=/docs/concepts-localization--overview).

\`context.isLocked: true\` is final, and no hook reopens the column; to open a column its metadata locks, give it \`context: { isLocked: false }\`. \`rowSettings.onGetLock(result, { record })\` runs after the record-level hooks with \`result.isLocked\` starting as \`!record.isActive()\`, so it can also unlock. \`context.cell.onGetLock(result, { record })\` runs after the cell-level hooks, and only for a cell whose column and record are open. A module locks with \`editing.locks.registerLock\`: see *Locks* on [**Hooks**](?path=/docs/controls-grid-extending-hooks--overview).

A lock that reads something outside its record, such as a toggle or the user's role, redraws nothing by itself: see *Redrawing* on [**Talking to the grid**](?path=/docs/controls-grid-talking-to-the-grid--overview). The lock column is \`RECORD_LOCK_COLUMN_KEY\`, hidden until a loaded row is locked, and a dimmed row carries the class \`LOCKED_RECORD_ROW_CLASS\`.

Locks gate only the grid's own editing: whether an editor opens and whether an in-place control is enabled. \`record.setValue()\` from your code ignores them, and a locked cell still shows and enforces validation.

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

## When the server refuses

A server can refuse a save the browser allowed. A provider reports that as \`{ success: false, errors: [{ fieldName, message }] }\`, and the row's save status turns red with the errors in its callout. How a provider saves to your server is under *Your own provider* on [**Data providers**](?path=/docs/concepts-data-providers--overview).

{{story: Refuse a save on the server}}

\`fieldName\` is the column's logical name, and the callout shows its header name; leave it out for an error about the whole record. Resolve a refusal rather than throwing: a save that throws is reported as failed, with the error's message in the callout. A refused record keeps its values and stays unsaved, ready to be saved again. The callout's title and button are \`grid.recordSaveErrorTitle\` and \`grid.recordSaveErrorDismiss\`.

## Keyboard

| Key | On a focused cell | While editing |
|---|---|---|
| F2, or typing a character | Opens the editor; on an in-place cell, steps into its control | Types |
| Enter | Moves down a row | Commits and moves down a row |
| Shift+Enter | Moves up a row | Commits and moves up a row |
| Esc | Nothing | Closes the editor and keeps what was typed; on an in-place cell, steps out |
| Space | Selects the row while row selection is on | Types a space |

## From your code

The module is \`grid.modules.find('editing')\`, or \`useGridModule('editing')\` inside what the grid draws.

| Member | Description |
|---|---|
| \`isEditing(record, columnName)\` | Whether the user is editing that cell, in place or in an editor. |
| \`isBeingEdited(cell)\` | The same for an \`IGridCell\`, counting an editor from the moment it is drawn. |
| \`isEditorAvailable(record, colDef)\` | Whether an editor may open over the cell: the column is not in-place and the cell is not locked. |
| \`start(cell)\`, \`finish(cell)\` | Steps into an in-place cell; ends the edit and brings the focus back to the cell. |
| \`isAutoSaveEnabled()\` | Whether each commit saves its record. |
| \`locks.get({ record?, columnName? })\` | Whether a column, a row or a cell is locked: \`{ isLocked, lockedBy? }\`, where \`lockedBy\` is \`'column'\`, \`'record'\` or \`'cell'\`. |
| \`locks.registerLock(hook, priority?)\` | Locks columns, records and cells. See *Locks* on [**Hooks**](?path=/docs/controls-grid-extending-hooks--overview). |
| \`events\` | \`onEditedCellChanged(previous, next)\`, as the module option. |

To change a value as a cell would, saving it with \`autoSave\`, go through its field: \`grid.services.get('fields').get(record, columnName).setValue(value)\`. \`record.setValue()\` changes the record and saves nothing.

## Changing how it looks

The editing module takes no \`components\` option. It draws two columns of its own, and you restyle them in \`colDefs\` by handing the module's cell its \`components\` through \`cellRendererParams\`, or by setting \`cellRenderer\` to a component that renders the cell. How slots work is under *Changing how it looks* on [**Appearance**](?path=/docs/controls-grid-appearance--overview).

\`\`\`tsx
<Grid
    modules={[createClientSideRowModelModule(), createEditingModule({ autoSave: true })]}
    colDefs={{ [RECORD_SAVE_COLUMN_KEY]: { cellRendererParams: { components: SAVE_STATUS } } }} />
\`\`\`

| Component | Key | Slots | Default | Draws |
|---|---|---|---|---|
| \`RecordSaveIndicatorCell\` | \`container\` | \`onRenderContainer\` | | The save status column's cell (\`RECORD_SAVE_COLUMN_KEY\`) |
| | \`indicator\` | \`onRenderContainer\`, \`onRenderSpinner\`, \`onRenderButton\` (with \`state\`), \`onRenderErrorCallout\` | \`RecordSaveUiIndicatorComponents\` | The spinner, check or error icon |
| | \`errorCallout\` | \`onRenderCallout\`, \`onRenderHeader\`, \`onRenderIcon\`, \`onRenderTitle\`, \`onRenderFields\`, \`onRenderField\`, \`onRenderFieldName\`, \`onRenderMessage\`, \`onRenderFooter\`, \`onRenderDismissButton\` | \`RecordSaveUiErrorCalloutComponents\` | Why a save failed |
| \`RecordLockIndicatorCell\` | \`container\` | \`onRenderContainer\` | | The lock column's cell (\`RECORD_LOCK_COLUMN_KEY\`) |
| | \`lockIcon\` | \`onRenderTooltip\`, \`onRenderIcon\` | | The lock of a locked record |
| \`RecordSaveSelectionCell\` | the keys of \`RecordSaveIndicatorCell\`, and \`checkbox\` | \`checkbox\`: \`onRenderContainer\`, \`onRenderCheckbox\` | \`RowSelectionUiCheckboxComponents\` | The checkbox column's cell (\`SELECTION_COLUMN_KEY\`) with row selection on |

| Piece | How to change it |
|---|---|
| The save status and its error callout | Through their slots; the defaults \`RecordSaveUiIndicatorComponents\` and \`RecordSaveUiErrorCalloutComponents\` are exported |
| The checkbox column, with row selection on | It is drawn by \`RecordSaveSelectionCell\`: use \`cellRendererParams\` to keep the save status, or render \`RecordSaveSelectionCell\` in a \`cellRenderer\` of your own |
| The lock in a locked column's header | An adornment keyed \`'lock'\` without slots: replace or remove it in \`context.header.onGetAdornments\` (see *Extend the header* on [**Columns**](?path=/docs/controls-grid-columns--overview)) |
| The lock in a locked cell | The cell's own \`lockIcon\`: see [**Custom cells**](?path=/docs/controls-grid-appearance-custom-cells--overview) |

{{story: Draw the save status your way}}
`

const meta = {
    title: 'Controls/Grid/Modules/Editing',
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
                story: `Approved entries are locked by \`rowSettings.onGetLock\`, Hourly rate by \`context.cell.onGetLock\` wherever the work is not billable, and Employee for good by \`context.isLocked\`; \`LabelsProvider\` words each lock's tooltip. Try: hover a lock, approve a Submitted entry, then close the week to remount the grid without the editing module.`,
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
                story: `The save column's \`cellRendererParams\` hand \`RecordSaveIndicatorCell\` new \`indicator\` and \`errorCallout\` slots: a labelled button, and the product's name in the failed-save callout. Try: set a price above 1,000.`,
            },
        },
    },
}
