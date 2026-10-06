import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import {
    EmptyCatalogueExample, HeaderCaptionExample, LoadingRowsExample, ModuleIconsExample, SaveStatusExample, StockBarExample, WarehouseLoadingExample,
} from '../../../grid/examples/customComponentsExamples'

const DESCRIPTION = `
Every piece the grid draws can be replaced, one part at a time: what a cell shows, a header's label, the overlays, the rows that are still loading, the save status and the icons modules add. What you leave alone keeps working, so hover, selection, focus, locks, errors and themes behave as before. To recolour the grid rather than redraw it, see [**Appearance**](?path=/docs/grid-appearance--overview).

## How replacing works

- A replaceable part is an \`onRender…\` function in a \`components\` object, grouped by the piece it belongs to. Every object is partial: what you leave out keeps its default.
- A part is called as a function, not mounted as a component, so it must not call hooks itself. Return a component that does.
- \`components.control.onRenderControl\` is the only part handed its default, as \`defaultRender\`. Every other part gets the props its default would get: to keep the default look, draw the same Fluent component with them, such as \`<Icon {...props} />\`.
- Define \`components\` objects, and the cell and header components that pass them, outside your component or memoize them. A new \`components\` object on \`<Grid.Root />\` redraws every overlay, loading row, save cell and lock cell.

## Cells

{{story: Draw stock as a bar}}

### Where a cell comes from

Each column says what draws its cells in its column definition, which you change through \`colDefs\` (see [**Columns**](?path=/docs/grid-columns--overview)):

| Key | Default | What it is for |
|---|---|---|
| \`cellRenderer\` | \`Grid.Cell.FieldRenderer\` for a provider column, \`EditingCell.FieldRenderer\` with the editing module, which replaces whatever an earlier module set, \`Grid.Cell.EmptyRenderer\` for a column you add | A cell of your own |
| \`cellEditor\` | \`EditingCell.FieldEditor\` for a provider column with the editing module, which replaces whatever an earlier module set, none for a column you add, which then cannot be edited | An editor of your own |
| \`cellRendererParams\` | | \`{ theme, components }\` for the default cell, with no component of your own |
| \`cellEditorParams\` | | The same for the default editor |

\`theme\` replaces the grid's theme as the start of that column's cell themes: zebra rows no longer apply, while theme hooks and \`onGetTheme\` still do.

### A cell's components

| Key | Parts | Drawn by |
|---|---|---|
| \`container\` | \`onRenderContainer\` | Every cell |
| \`loading\` | \`onRenderShimmer\` | Every cell |
| \`control\` | \`onRenderContainer\`, \`onRenderControl(props, defaultRender)\` | Renderers and editors |
| \`lockIcon\` | \`onRenderTooltip\`, \`onRenderIcon\` | \`EditingCell.Renderer\`, \`EditingCell.FieldRenderer\` |
| \`commands\` | \`onRenderContainer\`, \`onRenderCommandBar\` | \`Renderer\`, \`FieldRenderer\`, \`EmptyRenderer\` |
| \`fieldError\` | \`onRenderOutline\`, \`onRenderTooltip\`, \`onRenderIcon\` | \`Renderer\`, \`FieldRenderer\` |
| \`resizeGrip\` | \`onRenderContainer\`, \`onRenderGrip\` | Every cell of a column with the row resize grip |

\`onRenderControl\` draws the value, or the input while the cell takes one. \`props.parameters\` holds what the control is handed, \`Record.raw\` and \`Column.raw\` included. To change one piece of the default value instead, call \`defaultRender({ ...props, components })\` with any of \`onRenderText\`, \`onRenderPlaceholder\`, \`onRenderLink\`, \`onRenderLookup\`, \`onRenderOptions\`, \`onRenderFile\`, \`onRenderPrefixIcon\` and \`onRenderSuffixIcon\`. These apply while the cell shows its value, not while it takes input.

### The parts of a cell

\`Grid.Cell.FieldRenderer\` is \`Grid.Cell.Field\` around \`Grid.Cell.Renderer\`, which is \`Root\` > \`Theme\` > [\`ResizeGrip\`] > \`Container\` > \`Loading\` > \`Control\`, \`Commands\` and \`FieldError\`. The editing module's \`EditingCell.FieldRenderer\` adds \`CellLockIcon\` before \`Control\`. Build a cell of your own from the same parts:

| Part | What it is |
|---|---|
| \`Grid.Cell.Root\` | Makes everything inside it one cell, and draws it again whenever its record changes. Spread the cell's props into it. |
| \`EditingCell.Root\` | \`Grid.Cell.Root\` for a cell that can be edited: it takes input as an editor (\`isEditor\`) or a one-click column, and draws again as editing starts and ends. Exported by the editing module. |
| \`Grid.Cell.Field\` | Binds what is inside it to one column of one record: \`record\` and \`name\`. It can bind a column you add to a provider column's value. |
| \`Grid.Cell.Theme\` | Works out the cell's theme, from zebra rows to \`onGetTheme\`, and paints the cell in it. \`theme\` replaces the grid's theme as the start. |
| \`Grid.Cell.Container\` | The cell's surface. The hover, selection, focus and range highlights are drawn on it. |
| \`Grid.Cell.Loading\` | Draws a shimmer in place of what it wraps while the cell is loading. |
| \`Grid.Cell.Control\` | The value, or the input while the cell takes one. |
| \`CellLockIcon\` | The lock of a single locked value; exported by the editing module. |
| \`Grid.Cell.Commands\` | The cell's commands, while the row is hovered, focused or selected. |
| \`Grid.Cell.FieldError\` | The red outline and error icon of an invalid value. |
| \`Grid.Cell.ResizeGrip\` | The grip a row is dragged taller by. |
| \`Grid.Cell.Renderer\` | A whole cell (\`Container\` > \`Loading\` > \`Control\`), not bound to a field. |
| \`EditingCell.Editor\`, \`EditingCell.FieldEditor\` | A whole editor, and the same around \`Grid.Cell.Field\`. |
| \`Grid.Cell.EmptyRenderer\` | A cell with no value: \`Container\` > \`Loading\` > \`Commands\`. |
| \`Grid.Cell.NestedRoot\` | Draws its children in a React root of their own, so their key handlers run before AG Grid's. Only the grid's own contexts, the PCF context and the theme reach inside it. |
| \`Grid.Cell.Ui\` | \`Container\`, \`Control\`, \`Loading\`, \`LockIcon\`, \`Commands\`, \`FieldError\`, \`ResizeGrip\`: the same pieces, drawn from props alone, for the grid's look outside a cell. |

Rules for putting them together:

- \`Grid.Cell.Root\` comes first, and never inside another one: that throws.
- \`Grid.Cell.Loading\` goes inside \`Grid.Cell.Container\`, and \`Grid.Cell.ResizeGrip\` around it, never inside: both throw otherwise.
- Leave out \`Grid.Cell.Theme\` and the cell loses zebra rows and every theme. Leave out \`Grid.Cell.Container\` and it loses the hover, selection, focus and range highlights.
- \`Grid.Cell.Control\` with no \`Grid.Cell.Field\` above it has no column to draw, and shows \`---\`. Use \`FieldRenderer\` for a column with a value, or draw your own with \`onRenderControl\`.
- Read the record in a component drawn under \`Grid.Cell.Root\`, with \`useGridCell()\`, rather than in the body of your \`cellRenderer\`: only \`Root\`'s children draw again when a value changes.

## Headers

{{story: A header with a caption}}

A column's header is its definition's \`headerComponent\`, \`Grid.ColumnHeader.Renderer\` by default. To change parts of it with no component of your own, set \`headerComponentParams: { theme, components }\`.

| Key | Parts | What it draws |
|---|---|---|
| \`container\` | \`onRenderButton\` | The header itself, a button that opens the column's menu |
| \`prefix\` | \`onRenderContainer\` | What the modules draw before the name, such as the grouping icon |
| \`content\` | \`onRenderContainer\` | What holds the name and the required marker |
| \`label\` | \`onRenderText\` | The column's name |
| \`requiredMarker\` | \`onRenderText\` | The \`*\` of a column that needs a value |
| \`suffix\` | \`onRenderContainer\` | What the modules draw after the name: the sort and filter icons, and the editing module's column lock |
| \`menu\` | \`onRenderContextualMenu\` | The menu the header opens |

\`Grid.ColumnHeader.Renderer\` is \`Root\` > \`Theme\` > \`Container\` > (\`Prefix\`, \`Content\` > (\`Label\`, \`RequiredMarker\`), \`Suffix\`), with \`Menu\` beside \`Container\`. Each part from \`Container\` on takes the \`components\` of its own piece, and \`Grid.ColumnHeader.Root\` comes first in a header of your own. \`Grid.ColumnHeader.Ui\` holds the same pieces, drawn from props alone.

## Overlays and loading rows

{{story: An empty catalogue}}

{{story: Waiting for the warehouse}}

{{story: Rows that are still loading}}

These go in \`components\` on \`<Grid.Root />\`:

| Key | Parts | Shown |
|---|---|---|
| \`emptyRecordsOverlay\` | \`onRenderContainer\`, \`onRenderIcon\`, \`onRenderText\` | Over a grid with no rows that is not loading. The text is \`labels.noRecordsFound\`. |
| \`loadingOverlay\` | \`onRenderContainer\`, \`onRenderSpinner\`, \`onRenderText\` | Over the grid while the provider is loading, once it has been loading for 150 ms. The text is the provider's loading message, and \`onRenderText\` is called only when there is one. |
| \`rowLoading\` | \`onRenderShimmer\` | In place of a group's rows while they load, on the server-side row model |
| \`rowError\` | \`onRenderMessageBar\` | In place of a group's rows that failed to load, and in place of the totals row when its totals failed |

- A provider says what it waits for with \`setLoading(true, message)\` while it fetches. \`refresh()\` starts every load with no message.
- The empty overlay does not take clicks. Give a link or button in it \`pointer-events: auto\`.
- Rows load group by group only on the server-side row model: see [**Modules**](?path=/docs/grid-modules--overview).
- \`Grid.Overlay.Loading\`, \`Grid.Overlay.EmptyRecords\`, \`Grid.Row.Loading\` and \`Grid.Row.Error\` are what these keys change, and \`Grid.Overlay.Ui\` and \`Grid.Row.Ui\` draw the same pieces from props alone.

## Save status and locked rows

{{story: Save status your way}}

An editable grid reports each row's saves in a column of its own, and shows a lock at the start of a row locked as a whole (see [**Editing**](?path=/docs/grid-modules-editing--overview)). Their parts go in \`createEditingModule({ components })\`:

| Key | Part | Pieces |
|---|---|---|
| \`recordSaveCell\` | \`container\` | \`onRenderContainer\` |
| | \`indicator\` | \`onRenderContainer\`, \`onRenderSpinner\`, \`onRenderButton\`, whose props carry \`state\`: \`'succeeded'\` or \`'failed'\`, and \`onRenderErrorCallout\` |
| | \`errorCallout\` | \`onRenderCallout\`, \`onRenderHeader\`, \`onRenderIcon\`, \`onRenderTitle\`, \`onRenderFields\`, \`onRenderField\`, \`onRenderFieldName\`, \`onRenderMessage\`, \`onRenderFooter\`, \`onRenderDismissButton\` |
| \`recordLockCell\` | \`container\` | \`onRenderContainer\` |
| | \`lockIcon\` | \`onRenderTooltip\`, \`onRenderIcon\` |

- With row selection on, the editing module draws the save status in the row's checkbox cell instead, with the same \`recordSaveCell\` parts.
- The save and lock cells are cells too, so \`useGridCell()\` works in their parts and in the error callout.
- The editing module's cells are \`RecordSaveIndicatorCell\` and \`RecordLockIndicatorCell\`. To draw the status or the lock in a cell of your own, use \`RecordSaveIndicator\`, which draws its children while there is nothing to report, and \`RecordLockIcon\`, both inside \`Grid.Cell.Root\`. \`RecordSaveUi\` holds the indicator and the callout drawn from props alone.

## Module parts

{{story: Module icons of your own}}

Each module takes \`components\` of its own, read once, at mount:

| Module | Key | Pieces |
|---|---|---|
| \`createRowSelectionModule\` | \`cell\` | \`checkbox\` (\`onRenderContainer\`, \`onRenderCheckbox\`), plus the \`container\`, \`indicator\` and \`errorCallout\` of the save status |
| | \`header\` | \`headerCheckbox\` (\`onRenderContainer\`, \`onRenderCheckbox\`) |
| \`createSortingModule\` | \`sortIcon\` | \`onRenderIcon\`, whose props carry \`descending\` |
| \`createFilteringModule\` | \`filterIcon\` | \`onRenderIcon\` |
| | \`filterCallout\` | \`onRenderCallout\`, \`onRenderHeader\`, \`onRenderTitle\`, \`onRenderCloseButton\` |
| \`createGroupingModule\` | \`groupingIcon\` | \`onRenderIcon\`, the icon before a grouped column's name |
| | \`groupCell\` | \`container\`, \`loading\`, \`control\`, \`commands\`, \`toggle\` (\`onRenderContainer\`, \`onRenderButton\`, whose props carry \`isExpanded\`) and \`count\` (\`onRenderCount\`) |
| | \`expansionHeader\` | \`expandCollapse\` (\`onRenderContainer\`, \`onRenderExpandButton\`, \`onRenderCollapseButton\`) |
| \`createAggregationModule\` | \`totalCell\` | \`container\`, \`loading\`, \`commands\` and \`totalValue\` (\`onRenderContainer\`, \`onRenderLabel\`, \`onRenderValue\`) |
| | \`aggregateCell\` | \`container\`, \`loading\`, \`control\`, \`commands\` |

What each one draws, and when, is on [**Selection and clipboard**](?path=/docs/grid-modules-selection-and-clipboard--overview), [**Sorting and filtering**](?path=/docs/grid-modules-sorting-and-filtering--overview) and [**Grouping and totals**](?path=/docs/grid-modules-grouping-and-totals--overview). A group row's cell and a totals cell are cells too, so \`useGridCell()\` works in their parts.

## Reading what you are drawn in

Three hooks read the cell, field or header a part of yours is drawn in, and draw it again whenever the grid redraws that cell or header:

| Hook | Returns | Works inside |
|---|---|---|
| \`useGridCell()\` | The cell: \`getRecord()\`, \`getColumnName()\`, \`getColDef()\`, \`getSettings()\`, \`getAlignment()\`, \`isLocked()\`, \`isLoading()\`, \`isBeingEdited()\`, \`getCommands()\`, \`render()\` | \`Grid.Cell.Root\`; it throws anywhere else |
| \`useGridField()\` | The field: \`getRecord()\`, \`getColumn()\`, \`getValue()\`, \`getFormattedValue()\`, \`isValid()\` and \`setValue(value)\`, or \`undefined\` with no field bound | \`Grid.Cell.Field\`, which \`FieldRenderer\` and \`FieldEditor\` include |
| \`useGridColumnHeader()\` | The header: \`getName()\`, \`getTitle()\`, \`getColumn()\`, \`getColDef()\`, \`getSettings()\`, \`getAlignment()\`, \`isRequired()\`, \`isLocked()\`, \`getElement()\`, \`openMenu()\`, \`closeMenu()\` | \`Grid.ColumnHeader.Root\`; it throws anywhere else |

- \`field.setValue(value)\` is how a part of yours changes a value: it writes to the record and saves it when the editing module's \`autoSave\` is on. \`record.setValue()\` only writes.
- \`header.getColumn()\` is \`undefined\` for a column you add.
`

const meta = {
    title: 'Grid/Appearance/Custom Components',
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

export const DrawStockAsABar: Story = {
    name: 'Draw stock as a bar',
    render: () => renderStory(<StockBarExample />),
    parameters: {
        docs: {
            description: {
                story: `A shop manager sees at a glance what needs reordering: the *In stock* \`cellRenderer\` is \`Grid.Cell.FieldRenderer\` with a \`components.control.onRenderControl\` that draws a bar, red at or below the reorder level, and calls \`defaultRender\` for discontinued products. The bar reads its product through \`useGridCell()\`, so changing *In stock* or *Discontinued* redraws it.`,
            },
        },
    },
}

export const AHeaderWithACaption: Story = {
    name: 'A header with a caption',
    render: () => renderStory(<HeaderCaptionExample />),
    parameters: {
        docs: {
            description: {
                story: `Buyers need to know a price is in dollars, before VAT: a \`headerComponent\` is \`Grid.ColumnHeader.Renderer\` with a \`components.label.onRenderText\` that draws the label's own \`Text\` and a caption under it, looked up through \`useGridColumnHeader()\`. Sort by *Price* and the sort arrow keeps its place beside the name.`,
            },
        },
    },
}

export const AnEmptyCatalogue: Story = {
    name: 'An empty catalogue',
    render: () => renderStory(<EmptyCatalogueExample />),
    parameters: {
        docs: {
            description: {
                story: `A new shop before its first import: \`labels.noRecordsFound\` says what is missing, and \`components.emptyRecordsOverlay\` swaps the icon and draws the message's own \`Text\` larger, with a hint under it. Change the hint or the icon in **Code**.`,
            },
        },
    },
}

export const WaitingForTheWarehouse: Story = {
    name: 'Waiting for the warehouse',
    render: () => renderStory(<WarehouseLoadingExample />),
    parameters: {
        docs: {
            description: {
                story: `Stock levels come from a warehouse system that takes a few seconds to answer and says what it waits for with \`setLoading(true, message)\`, and \`components.loadingOverlay\` draws the wait as a card with a truck and a progress bar above that message. Press *Check stock again*.`,
            },
        },
    },
}

export const RowsThatAreStillLoading: Story = {
    name: 'Rows that are still loading',
    render: () => renderStory(<LoadingRowsExample />),
    parameters: {
        docs: {
            description: {
                story: `The warehouse sends a category's products only when someone opens it: on the server-side row model a group's rows load as it opens, and \`components.rowLoading\` draws them as a spinner with a note. Open a category (the server-side row model and grouping are AG Grid Enterprise).`,
            },
        },
    },
}

export const SaveStatusYourWay: Story = {
    name: 'Save status your way',
    render: () => renderStory(<SaveStatusExample />),
    parameters: {
        docs: {
            description: {
                story: `Price changes go to a pricing service that refuses a price over $1,000 without a manager's approval: \`createEditingModule({ components: { recordSaveCell } })\` turns the save status into a labelled button in a wider save status column, and names the product in the title of the failed-save callout. Set a price above 1,000, then click *Not saved*.`,
            },
        },
    },
}

export const ModuleIconsOfYourOwn: Story = {
    name: 'Module icons of your own',
    render: () => renderStory(<ModuleIconsExample />),
    parameters: {
        docs: {
            description: {
                story: `A catalogue sorted by price and grouped by category, with module icons in the shop's blue: sorting's \`sortIcon\`, filtering's \`filterIcon\` and grouping's \`groupingIcon\` go in each module's \`components\`, and grouping's \`groupCell.count\` draws each category's size as a badge. Filter a column to see its funnel (grouping is AG Grid Enterprise).`,
            },
        },
    },
}
