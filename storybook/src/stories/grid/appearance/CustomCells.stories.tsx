import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { RichTextExample, WinChanceExample } from '../../../grid/examples/customComponentsExamples'

const DESCRIPTION = `
Every column of the provider draws its cells with \`Grid.Cell.Renderer\`, bound to the record's value, and edits them with \`EditingCell.Editor\` while the editing module is on. To change what a column's cells look like, hand those cells new slots through \`cellRendererParams\` and \`cellEditorParams\` in \`colDefs\`; to lay a cell out yourself, give the column a \`cellRenderer\` of your own.

\`\`\`tsx
const HTML_RENDERER: ICellRendererComponents = {
    columnControl: { onRenderControl: () => <HtmlValue /> },
}

<Grid
    modules={[createClientSideRowModelModule(), createEditingModule()]}
    colDefs={{ description: { cellRendererParams: { components: HTML_RENDERER } } }} />
\`\`\`

Either way, your cell keeps what the grid gives every cell: themes, validation errors, loading, commands, locks and row resizing.

## Changing how it looks

\`cellRendererParams\` and \`cellEditorParams\` take \`components\`, a map of the cell's parts and their slots, and \`theme\`, a Fluent theme the cell's colours are generated from in place of the grid's own. How slots work is under *Changing how it looks* on [**Appearance**](?path=/docs/controls-grid-appearance--overview).

{{story: Edit descriptions as rich text}}

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`columnControl\` | \`onRenderControl(props, defaultRender)\` | \`CellColumnControlComponents\` | The value. The only slot handed a \`defaultRender\`, to fall back to the grid's drawing for some records |
| \`control\` | \`onRenderContainer\` | | The room the value is drawn in |
| \`container\` | \`onRenderContainer\` | | The whole cell |
| \`loading\` | \`onRenderShimmer\` | | The shimmer while the cell waits |
| \`commands\` | \`onRenderContainer\`, \`onRenderCommandBar\` | \`CellUiCommandsComponents\` | The column's commands |
| \`fieldError\` | \`onRenderOutline\`, \`onRenderTooltip\`, \`onRenderIcon\` | | The validation outline and message. Keep the \`className\` \`onRenderOutline\` gets: the grid hides an invalid cell's focus border by it |
| \`resizeGrip\` | \`onRenderContainer\`, \`onRenderGrip\` | | The grip a row is dragged taller by |
| \`lockIcon\` | \`onRenderTooltip\`, \`onRenderIcon\` | | The lock of a locked cell, with the editing module |

The editor takes \`container\`, \`loading\`, \`control\`, \`columnControl\` and \`resizeGrip\`; in an editor, \`columnControl\` draws the input. Group rows and totals draw their own cells, restyled through the grouping and aggregation modules: see [**Grouping and totals**](?path=/docs/controls-grid-modules-grouping-and-totals--overview).

## Write a cell of your own

A \`cellRenderer\` of your own is any component that gets AG Grid's cell params, \`IGridCellParams\`. Render \`Grid.Cell.Renderer\` inside it, with \`components\` of its own, and wrap it in \`Grid.Cell.Field\` to bind it to its column's value, formatting and validation:

\`\`\`tsx
const HtmlCell = (props: IGridCellParams) => <Grid.Cell.Field record={props.data} name={props.colDef!.colId!}>
    <Grid.Cell.Renderer {...props} components={HTML_RENDERER} />
</Grid.Cell.Field>
\`\`\`

A column you add in \`colDefs\` holds no value of the provider's: draw it with \`Grid.Cell.Renderer\` and no \`Field\`, or with \`Grid.Cell.EmptyRenderer\` for an empty cell. An editor of your own renders \`EditingCell.Editor\` the same way.

## Compose it from the parts

To lay out the cell yourself, compose it from \`Grid.Cell\`'s parts. Each brings one piece of the grid's behaviour, so the cell keeps only what you include. Nest them in this order:

| Part | What it brings |
|---|---|
| \`Field\` | Binds the cell to a record's column, for \`useGridField()\`. Leave it out for a column you add. |
| \`Root\` | Makes it a cell and redraws it when the record changes. Required; in an editor, pass \`takesInput\`. |
| \`Theme\` | The cell's colours: zebra rows and colour rules. |
| \`ResizeGrip\` | The grip a row is dragged taller by. |
| \`Container\` | Fills the cell in the theme's font and text colour. |
| \`Loading\` | The shimmer while the cell waits, in place of what it wraps. |
| \`LockIcon\` | The lock of a locked cell, with the editing module. Goes inside \`Loading\`, before \`Control\`. |
| \`Control\` | The room the value is drawn in; the commands, error icon and lock keep to its edge. |
| \`ColumnControl\` | Draws the value: the grid's value renderer, a PCF control the column names, or your \`onRenderControl\`. Goes inside \`Control\`. |
| \`Commands\` | The column's commands, shown while the row is hovered. |
| \`FieldError\` | The validation outline and its message. |

To draw a value of your own, put it inside \`Control\` in place of \`ColumnControl\`, and every other part keeps its place.

{{story: Forecast the win chance}}

## Read the cell

Call these React hooks in a component inside the cell, so it redraws when a value changes:

| Hook | Returns |
|---|---|
| \`useGridCell()\` | The cell: its record, column, context, theme, \`isLocked()\`, \`isLoading()\`, \`isBeingEdited()\` and \`render()\` |
| \`useGridField()\` | The field: its value, formatted value, \`isValid()\` and \`setValue(value)\`, which saves with the editing module's \`autoSave\` |
`

const meta = {
    title: 'Controls/Grid/Appearance/Custom cells',
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

export const EditDescriptionsAsRichText: Story = {
    name: 'Edit descriptions as rich text',
    render: () => renderStory(<RichTextExample />),
    parameters: {
        docs: {
            description: {
                story: `\`cellRendererParams\` draw the HTML description, sanitized with DOMPurify, and \`cellEditorParams\` edit it in a rich text editor, both through \`columnControl.onRenderControl\`. Try: double-click a description and add bold, a list or a link; the row grows to fit with \`autoHeight\`.`,
            },
        },
    },
}

export const ForecastTheWinChance: Story = {
    name: 'Forecast the win chance',
    render: () => renderStory(<WinChanceExample />),
    parameters: {
        docs: {
            description: {
                story: `Win chance composed from the parts, with a ring gauge inside \`Control\` in place of \`ColumnControl\`: zebra rows, a Forecast command, a shimmer while it forecasts, the lock on won and lost deals and an outline over 100 still reach it. Try: press Forecast on a row, or double-click a chance and enter 120.`,
            },
        },
    },
}
