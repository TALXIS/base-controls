import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { RichTextExample, WinChanceExample } from '../../../grid/examples/customComponentsExamples'

const DESCRIPTION = `
Every column draws its cells with the grid's own cell, which shows the value the way its data type reads. When a column needs something else, give it a cell of your own: set \`cellRenderer\` in \`colDefs\` to draw its cells, and \`cellEditor\` to edit them (with the editing module).

\`\`\`tsx
<Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), editing: createEditingModule() }}
    colDefs={{ description: { cellRenderer: HtmlCell, cellEditor: HtmlEditor } }} />
\`\`\`

You build that cell one of two ways:

1. **Reuse the grid's cell** and replace the parts you need through \`components\`.
2. **Compose it from the parts**, when you want to lay out the cell yourself.

Either way it keeps what the grid gives every cell: themes, validation errors, loading, commands, locks and row resizing.

## 1. Reuse the grid's cell

Render the grid's cell and pass \`components\`:

| | Core | Editing module on |
|---|---|---|
| Renderer | \`Grid.Cell.Renderer\` | \`EditingCell.Renderer\` |
| Editor | | \`EditingCell.Editor\` |

- **With the editing module on, use \`EditingCell\`.** Its cells draw the lock and know when they are edited; the core ones don't.
- **To bind the cell to its column's value**, wrap it in \`Grid.Cell.Field\`. It then draws the value with its formatting and validation, and \`useGridField()\` works inside it. Leave it out for a column you add.

| Key | Parts |
|---|---|
| \`columnControl\` | \`onRenderControl(props, defaultRender)\`: draws the value |
| \`control\` | \`onRenderContainer\` |
| \`container\` | \`onRenderContainer\` |
| \`loading\` | \`onRenderShimmer\` |
| \`commands\` | \`onRenderContainer\`, \`onRenderCommandBar\` |
| \`fieldError\` | \`onRenderOutline\`, \`onRenderTooltip\`, \`onRenderIcon\` |
| \`resizeGrip\` | \`onRenderContainer\`, \`onRenderGrip\` |
| \`lockIcon\` | \`onRenderTooltip\`, \`onRenderIcon\` (\`EditingCell.Renderer\` only) |

- \`onRenderControl\` gets the default as \`defaultRender\`, so you can fall back to it for some records.
- Every key is optional: what you leave out keeps its default.
- A part is called, not mounted, so it can't use hooks itself. Return a component that does.
- Define \`components\` outside your component, so the cell does not redraw on every render.

{{story: Edit descriptions as rich text}}

## 2. Compose it from the parts

Each part brings one piece of the grid's behaviour, so your cell keeps what you include. The demo below composes them in the order the grid's own cell does.

| Part | What it brings |
|---|---|
| \`Field\` | Binds the cell to a record's column, for \`useGridField()\`. Leave it out for a column you add. |
| \`Root\` | Makes it a cell and redraws it when the record changes. Required. With the editing module, use \`EditingCell.Root\`, and \`isEditor\` in an editor. |
| \`Theme\` | The cell's colours: zebra rows and colour rules. |
| \`ResizeGrip\` | The grip a row is dragged taller by. |
| \`Container\` | Hover, selection and focus. |
| \`Loading\` | The shimmer while the record loads, in place of what it wraps. |
| \`Control\` | The room the value is drawn in. The commands, error icon and lock keep to its edge. |
| \`ColumnControl\` | Decides what the column draws for the value, and draws it: the grid's value renderer, a PCF control the column names, or your \`onRenderControl\`. Goes inside \`Control\`. |
| \`Commands\` | The column's \`onGetCommands\`, shown while the row is hovered. |
| \`FieldError\` | The validation outline and its message. |
| \`CellLockIcon\` | The lock, from the editing module. Goes inside \`Loading\`, before the value. |

- Keep this order; any part you leave out is simply not drawn.
- To draw a value of your own, put it inside \`Control\` in place of \`ColumnControl\`. It fills the room the value would, and every other part keeps its place.

### Reading the cell

| Hook | Returns |
|---|---|
| \`useGridCell()\` | The cell: its record, column, settings, \`isLocked()\`, \`isLoading()\`, \`isBeingEdited()\` and \`render()\` |
| \`useGridField()\` | The field: its value, formatted value, \`isValid()\` and \`setValue(value)\`, which saves with the editing module's \`autoSave\` |

Call them in a component inside the cell, so it redraws when a value changes.

{{story: Forecast the win chance}}
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
                story: `Reuses the grid's cells inside \`Grid.Cell.Field\`: \`EditingCell.Renderer\` draws the HTML description (sanitized with DOMPurify) and \`EditingCell.Editor\` edits it in a rich text editor (react-simple-wysiwyg), both through \`columnControl.onRenderControl\`. Double-click a description to try bold, lists and links; the row grows to fit with \`autoHeight\`.`,
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
                story: `Win chance is composed from the parts, with a ring gauge inside \`Control\` in place of \`ColumnControl\`, and the grid's features still reach it: zebra rows through \`Theme\`, a Forecast command on hover through \`Commands\`, a shimmer while it forecasts through \`Loading\`, the lock on won and lost deals through \`CellLockIcon\`, and an outline for a chance over 100 through \`FieldError\`. Double-click a chance to edit it with the grid's own editor.`,
            },
        },
    },
}
