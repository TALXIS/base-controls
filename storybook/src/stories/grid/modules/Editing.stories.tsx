import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { CheckHoursExample, FreezeApprovedExample, LogHoursExample, ReviewChangesExample, SaveStatusExample, ServerRefusesExample, TickBillableExample } from '../../../grid/examples/editingExamples'

const DESCRIPTION = `
Without the editing module the grid is read-only. With it, each column is edited with its data type's own control, every save reports back on its row, and you decide what stays locked. Try it below: change an entry's hours.

{{canvas: Log hours with auto-save}}

## How a value commits

Every column can be edited unless its metadata sets \`IsValidForUpdate: false\` (see [**Data**](?path=/docs/controls-grid-data--overview)); file, image and ribbon columns never open an editor. While the module is on, a double-click opens the cell's editor rather than the record. A value reaches the record when the cell's control commits it:

| Control | Columns | Commits |
|---|---|---|
| Text input | Text, multiline text, email, phone, URL, numbers, currency, a typed duration | When the input loses focus or the editor closes |
| Picker that closes | Option set, two options, date only, a duration picked from its list | As soon as a value is picked |
| Picker that stays open | Date and time, multi-select option set, lookup | On every pick, until you leave the cell |

Esc closes the editor and keeps what was typed, and closing an editor without changing the value commits nothing; \`record.clearChanges()\` is the undo. A paste, a cut or a fill writes text into each cell, parsed with the column's data type, and text that does not parse leaves the cell as it was.

## Save

With \`enableAutoSave\`, each commit calls \`record.save()\` straight away, and a paste saves each record once. Without it, edits stay on the records until you call \`provider.save()\` or \`provider.clearChanges()\`; the grid marks nothing as changed, so build your save bar from the provider (see *Edit and save* on [**Data providers**](?path=/docs/concepts-data-providers--overview)). The save events are under *Follow saves* on [**Props and events**](?path=/docs/controls-grid-props-and-events--overview).

{{story: Review changes, then save them all}}

### The save status

An editable grid adds a save status column, \`RECORD_SAVE_COLUMN_KEY\`, pinned at the start of each row. It shows a spinner while the record saves, a green check for two seconds once it saved, and a red icon once it was refused, which lists each error under its column's name when clicked. With row selection on, the status is drawn in the row's checkbox cell instead.

The red icon lives only on screen: a row that scrolls out of view and back, or a grid that remounts, loses it. To hide the column, set \`hide: true\` on its definition from a column definitions hook at \`GRID_MODULE_PRIORITY.editing + 1\`, as the example under *Changing how it looks* sets its width (see *Change a column* on [**Columns**](?path=/docs/controls-grid-columns--overview)).

## Validation

A value that fails validation shows an error icon in its cell, with the message in its tooltip, and a red outline while the cell has focus. \`record.save()\` then refuses the record without calling the provider, and the row's save status turns red.

{{story: Check hours as they are entered}}

| Source | Where it is set | Checks |
|---|---|---|
| Required | \`metadata.RequiredLevel\` \`1\` or \`2\` on the provider column | The value is not empty |
| Built-in | The column's data type and metadata | Single-line text against \`MaxLength\`, numbers against \`MinValue\` and \`MaxValue\`, and number, email, URL and date formats |
| One column | \`context.cell.validationHook(result, { record })\` on the column's definition | Your rule for that column; it may read any column of the record |
| Every column | \`hooks.validation.add(hook, priority?)\` on the \`validation\` service | Your rule for every column: see *Validation* on [**Hooks**](?path=/docs/controls-grid-extending-hooks--overview) |

Your rules run first, then the required and built-in checks, so a rule can add an error but not clear a built-in one. The rules are set on the provider's records: they gate every save, a \`provider.save()\` from outside the grid included, and they replace a \`record.expressions.setValidationExpression\` of your own on the same column. Validation does not need the editing module, so a read-only grid shows invalid values too; only the editing module draws a required column's asterisk.

## Edit in place

\`context.cell.enableOneClickEdit: true\` on a column's definition draws the column's editing control in the cell itself, so no editor opens: a two options column becomes a switch, an option set a coloured picker while \`enableOptionSetColors\` is on.

{{story: Tick billable in place}}

With the cell focused, F2 or typing a character steps into its control and Esc steps out. A locked cell, and every cell while editing is off, draws its control disabled. Grouping turns it off on the columns it groups by.

## Locks

Locks decide what can be edited. The levels are checked in the order of the table, and the first that locks wins: only its mark is drawn, so a cell in a locked column or row shows no lock of its own.

{{story: Freeze approved entries}}

| Level | Locked by | Drawn as |
|---|---|---|
| Grid | No editing module | Nothing |
| Column | \`context.isLocked\`, which defaults to \`!metadata.IsValidForUpdate\`, or a lock hook asked about \`{ columnName }\` | A lock in the header |
| Record | A lock hook asked about \`{ record }\`, or an inactive record | A dimmed row, and a lock in a column pinned at the start |
| Cell | \`context.cell.lockHook\`, or a lock hook asked about \`{ record, columnName }\` | A lock in the cell |

\`context.isLocked: true\` is final; to open a column its metadata locks, give it \`context: { isLocked: false }\`. Lock hooks are added with \`editing.locks.hooks.lock.add\`; in \`onSetup\`, reach the module with \`grid.modules.observe('editing', …)\`, as the example does (see *Locks* on [**Hooks**](?path=/docs/controls-grid-extending-hooks--overview)). A hook asked about \`{ record }\` starts with \`result.isLocked\` as \`!record.isActive()\`, so it can also unlock. \`context.cell.lockHook\` runs after the cell-level hooks, only for a cell whose column and record are open.

Locks gate only the grid's own editing: \`record.setValue()\` from your code ignores them. A lock that reads something outside its record, such as a toggle or the user's role, redraws nothing by itself: see *Redrawing* on [**Talking to the grid**](?path=/docs/controls-grid-talking-to-the-grid--overview). The lock column is \`RECORD_LOCK_COLUMN_KEY\`, hidden until a loaded row is locked, and a dimmed row carries the class \`LOCKED_RECORD_ROW_CLASS\`. To change the tooltips, as the example does, see [**Localization**](?path=/docs/concepts-localization--overview).

### Inactive records

A record the provider reports inactive (\`record.isActive()\` is \`false\`) starts out locked. The memory, FetchXml and Power Apps dataset providers report every record active, so lock inactive records yourself in a lock hook asked about \`{ record }\`, for example from Dataverse's \`statecode\`, as the approved entries above are locked from their status.

## When the server refuses

A server can refuse a save the browser allowed. A provider reports that as \`{ success: false, errors: [{ fieldName, message }] }\`, and the row's save status turns red with the errors in its callout. How a provider saves to your server is under *Your own provider* on [**Data providers**](?path=/docs/concepts-data-providers--overview).

{{story: Refuse a save on the server}}

\`fieldName\` is the column's logical name, and the callout shows the column's header name; leave it out for an error about the whole record. Resolve with a refusal rather than throwing: a save that throws is reported as failed too, with the error's message in the callout. A refused record keeps its values and stays unsaved, ready to be saved again.

## Options

The options are *At mount*: see *Change a prop that is read at mount* on [**Props and events**](?path=/docs/controls-grid-props-and-events--overview).

| Option | Type | Default | Description |
|---|---|---|---|
| \`enableAutoSave\` | \`boolean\` | \`false\` | Saves a record each time one of its values is committed. |
| \`onEditedCellChanged\` | \`(previous?, next?) => void\` | None | Fires when an editor opens or closes, or the user steps into or out of an in-place cell. Each argument is \`{ recordId, columnName }\`. |

## Changing how it looks

The editing module takes no \`components\` option. It draws two columns of its own, and you restyle them from a column definitions hook at \`GRID_MODULE_PRIORITY.editing + 1\` by handing the module's cell its \`components\` through \`cellRendererParams\`, or by setting \`cellRenderer\` to a component that renders the cell. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Component | Key | Slots | Default | Draws |
|---|---|---|---|---|
| \`RecordSaveIndicatorCell\` | \`container\` | \`onRenderContainer\` | | The save status column's cell (\`RECORD_SAVE_COLUMN_KEY\`) |
| | \`indicator\` | \`onRenderContainer\`, \`onRenderSpinner\`, \`onRenderButton\` (with \`state\`), \`onRenderErrorCallout\` | \`RecordSaveUiIndicatorComponents\` | The spinner, check or error icon |
| | \`errorCallout\` | \`onRenderCallout\`, \`onRenderHeader\`, \`onRenderIcon\`, \`onRenderTitle\`, \`onRenderFields\`, \`onRenderField\`, \`onRenderFieldName\`, \`onRenderMessage\`, \`onRenderFooter\`, \`onRenderDismissButton\` | \`RecordSaveUiErrorCalloutComponents\` | Why a save failed |
| \`RecordLockIndicatorCell\` | \`container\` | \`onRenderContainer\` | | The lock column's cell (\`RECORD_LOCK_COLUMN_KEY\`) |
| | \`lockIcon\` | \`onRenderTooltip\`, \`onRenderIcon\` | | The lock of a locked record |
| \`RecordSaveSelectionCell\` | the keys of \`RecordSaveIndicatorCell\`, and \`checkbox\` | \`checkbox\`: \`onRenderContainer\`, \`onRenderCheckbox\` | \`RowSelectionUiCheckboxComponents\` | The checkbox column's cell (\`SELECTION_COLUMN_KEY\`) with row selection on |

The lock in a locked column's header is an adornment keyed \`'lock'\`, which you replace or remove in \`context.header.adornmentsHook\` (see *Extend the header* on [**Columns**](?path=/docs/controls-grid-columns--overview)). The lock in a locked cell is the cell's own \`lockIcon\` piece: see [**Custom cells**](?path=/docs/controls-grid-appearance-custom-cells--overview).

{{story: Draw the save status your way}}

## Reference

### Keyboard

| Key | On a focused cell | While editing |
|---|---|---|
| F2, or typing a character | Opens the editor; on an in-place cell, steps into its control | Types |
| Enter | Moves down a row | Commits and moves down a row |
| Shift+Enter | Moves up a row | Commits and moves up a row |
| Esc | Nothing | Closes the editor and keeps what was typed; on an in-place cell, steps out |
| Space | Selects the row while row selection is on | Types a space |

### Members

The module is \`grid.modules.find('editing')\`, or \`useGridModule('editing')\` inside what the grid draws.

| Member | Description |
|---|---|
| \`isEditing(record, columnName)\` | Whether the user is editing that cell, in place or in an editor. |
| \`isBeingEdited(cell)\` | The same for an \`IGridCell\`, counting an editor from the moment it is drawn. |
| \`isEditorAvailable(record, colDef)\` | Whether an editor may open over the cell: the column is not in-place and the cell is not locked. |
| \`start(cell)\`, \`finish(cell)\` | Steps into an in-place cell; ends the edit and brings the focus back to the cell. |
| \`isAutoSaveEnabled()\` | Whether each commit saves its record. |
| \`locks.get({ record?, columnName? })\` | \`{ isLocked, lockedBy? }\`, where \`lockedBy\` is \`'column'\`, \`'record'\` or \`'cell'\`. |
| \`locks.hooks.lock.add(hook, priority?)\` | Locks columns, records and cells. See *Locks* on [**Hooks**](?path=/docs/controls-grid-extending-hooks--overview). |
| \`events\` | \`onEditedCellChanged\`: see *Options*. |

To change a value as a cell would, saving it with \`enableAutoSave\`, go through its field: \`grid.services.get('fields').get(record, columnName).setValue(value)\`. \`record.setValue()\` changes the record and saves nothing.

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Props and events', iconName: 'Settings', href: '?path=/docs/controls-grid-props-and-events--overview', text: 'Follow every save, and every value that changes.' },
    { title: 'Hooks', iconName: 'Plug', href: '?path=/docs/controls-grid-extending-hooks--overview', text: 'Lock and validate across every column from a module.' },
    { title: 'Selection and clipboard', iconName: 'MultiSelect', href: '?path=/docs/controls-grid-modules-selection-and-clipboard--overview', text: 'Select rows, and paste blocks of cells into an editable grid.' },
]

const meta = {
    title: 'Controls/Grid/Modules/Editing',
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

export const LogHoursWithAutoSave: Story = {
    name: 'Log hours with auto-save',
    render: () => renderStory(<LogHoursExample />),
}

export const ReviewChangesThenSaveThemAll: Story = {
    name: 'Review changes, then save them all',
    render: () => renderStory(<ReviewChangesExample />),
    parameters: {
        docs: {
            description: {
                story: `Corrections wait for the ribbon's Save and Discard changes, from \`enableSave\` and \`enableDiscard\`. Try: change two entries and save them from the ribbon.`,
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
                story: `\`context.cell.validationHook\` keeps *Hours* between 0.25 and 12, and \`RequiredLevel\` makes *Work done* required. Try: enter 14 hours.`,
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
                story: `A payroll server, stood in for by an \`onRecordSave\` interceptor, refuses entries dated before last week's Wednesday. Try: change the hours of one of the first five entries.`,
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
                story: `One lock hook locks approved entries and the *Hourly rate* of work that is not billable, and \`context.isLocked\` locks *Employee*. Try: hover a lock.`,
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
                story: `*Billable* is a switch in its cell through \`context.cell.enableOneClickEdit\`, saved by auto-save. Try: switch a billable entry off.`,
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
                story: `The save column's \`cellRendererParams\` give \`RecordSaveIndicatorCell\` a labelled button and a callout titled with the product's name. Try: set a price above 1,000.`,
            },
        },
    },
}
