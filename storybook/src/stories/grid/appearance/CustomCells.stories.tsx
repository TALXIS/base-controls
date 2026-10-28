import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { RichTextExample, WinChanceExample } from '../../../grid/examples/customComponentsExamples'

const DESCRIPTION = `
Every column draws its cells with the grid's own cell, which shows the value the way its data type reads. When a column needs something else, give it a cell of your own: \`cellRenderer\` in \`colDefs\` draws its cells, and \`cellEditor\` edits them with the editing module.

\`\`\`tsx
<DatasetControl onLoad={loadDeals}>
    <DatasetControl.Body>
        <Grid
            modules={[createClientSideRowModelModule(), createEditingModule()]}
            colDefs={{ description: { cellRenderer: HtmlCell, cellEditor: HtmlEditor } }} />
    </DatasetControl.Body>
</DatasetControl>
\`\`\`

Either way you build it, your cell keeps what the grid gives every cell: themes, validation errors, loading, commands, locks and row resizing.

## Reuse the grid's cell

Render \`Grid.Cell.Renderer\`, or \`EditingCell.Editor\` for an editor, and replace the parts you need through \`components\`. Wrap it in \`Grid.Cell.Field\` to bind it to its column's value, with its formatting and validation; leave that out for a column you add.

{{story: Edit descriptions as rich text}}

| Key | Parts | Description |
|---|---|---|
| \`columnControl\` | \`onRenderControl(props, defaultRender)\` | The value. Call \`defaultRender\` to fall back to the grid's for some records. |
| \`control\` | \`onRenderContainer\` | The room the value is drawn in. |
| \`container\` | \`onRenderContainer\` | The whole cell. |
| \`loading\` | \`onRenderShimmer\` | The shimmer while the record loads. |
| \`commands\` | \`onRenderContainer\`, \`onRenderCommandBar\` | The column's commands. |
| \`fieldError\` | \`onRenderOutline\`, \`onRenderTooltip\`, \`onRenderIcon\` | The validation outline and message. Keep the \`className\` \`onRenderOutline\` receives: the grid hides the focus border of an invalid cell by it. |
| \`resizeGrip\` | \`onRenderContainer\`, \`onRenderGrip\` | The grip a row is dragged taller by. |
| \`lockIcon\` | \`onRenderTooltip\`, \`onRenderIcon\` | The lock, drawn only with the editing module. |

The parts follow the \`components\` rules. See *Replace what the grid draws* on [**Appearance**](?path=/docs/grid-appearance--overview).

## Compose it from the parts

When you want to lay out the cell yourself, compose it from \`Grid.Cell\`'s parts. Each brings one piece of the grid's behaviour, so the cell keeps only what you include. List them in this order:

| Part | Description |
|---|---|
| \`Field\` | Binds the cell to a record's column, for \`useGridField()\`. Leave it out for a column you add. |
| \`Root\` | Makes it a cell and redraws it when the record changes. Required. In an editor, pass \`takesInput\`. |
| \`Theme\` | The cell's colours: zebra rows and colour rules. |
| \`ResizeGrip\` | The grip a row is dragged taller by. |
| \`Container\` | Fills the cell in the theme's font and text colour. |
| \`Loading\` | The shimmer while the record loads, in place of what it wraps. |
| \`Control\` | The room the value is drawn in. The commands, error icon and lock keep to its edge. |
| \`ColumnControl\` | Draws the value: the grid's value renderer, a PCF control the column names, or your \`onRenderControl\`. Goes inside \`Control\`. |
| \`Commands\` | The column's commands, shown while the row is hovered. |
| \`FieldError\` | The validation outline and its message. |
| \`LockIcon\` | The lock of a cell locked for its record, with the editing module. Goes inside \`Loading\`, before the value. |

To draw a value of your own, put it inside \`Control\` in place of \`ColumnControl\`, and every other part keeps its place.

{{story: Forecast the win chance}}

### Reading the cell

Call these React hooks in a component inside the cell, so it redraws when a value changes:

| Hook | Returns |
|---|---|
| \`useGridCell()\` | The cell: its record, column, context, \`isLocked()\`, \`isLoading()\`, \`isBeingEdited()\` and \`render()\` |
| \`useGridField()\` | The field: its value, formatted value, \`isValid()\` and \`setValue(value)\`, which saves with the editing module's \`autoSave\` |
`

const meta = {
    title: 'Grid/Appearance/Custom cells',
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
                story: `\`Grid.Cell.Renderer\` draws the HTML description, sanitized with DOMPurify, and \`EditingCell.Editor\` edits it in a rich text editor, both through \`columnControl.onRenderControl\`. Try: double-click a description and add bold, a list or a link; the row grows to fit with \`autoHeight\`.`,
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
