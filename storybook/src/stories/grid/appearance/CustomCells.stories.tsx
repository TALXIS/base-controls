import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { RichTextExample, WinChanceExample } from '../../../grid/examples/customComponentsExamples'

const DESCRIPTION = `
A cell is a React component that AG Grid draws for every row of a column. Build yours from the grid's own cell or from its parts, and it keeps what the grid gives every cell: themes, validation errors, loading, commands and row resizing.

## Setting your own cell

Set \`cellRenderer\` to draw a column's cells, and \`cellEditor\` to edit them with the editing module.

\`\`\`tsx
<Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule(), editing: createEditingModule() }}
    colDefs={{ description: { cellRenderer: HtmlCell, cellEditor: HtmlEditor } }} />
\`\`\`

- A module can set the same keys for many columns from its \`registerColumnDefinitions\` hook.
- Leave them out and the grid uses its own cells from the table below.

## Which cell to start from

| | Core | Editing module on |
|---|---|---|
| Renderer | \`Grid.Cell.Renderer\`, \`Grid.Cell.FieldRenderer\` | \`EditingCell.Renderer\`, \`EditingCell.FieldRenderer\` |
| Editor | | \`EditingCell.Editor\`, \`EditingCell.FieldEditor\` |

- **With the editing module on, use \`EditingCell\`.** Its cells draw the lock and know when they are edited; the core ones don't.
- **The \`Field\` variants** bind the cell to its column's value: formatting, validation and \`useGridField()\`. Use them for provider columns, and the plain ones for a column you add.

## Reuse the grid's cell

Render one of the cells above and pass \`components\` to replace the parts you need, usually how the value is drawn.

| Key | Parts |
|---|---|
| \`control\` | \`onRenderContainer\`, \`onRenderControl(props, defaultRender)\` |
| \`container\` | \`onRenderContainer\` |
| \`loading\` | \`onRenderShimmer\` |
| \`commands\` | \`onRenderContainer\`, \`onRenderCommandBar\` |
| \`fieldError\` | \`onRenderOutline\`, \`onRenderTooltip\`, \`onRenderIcon\` |
| \`resizeGrip\` | \`onRenderContainer\`, \`onRenderGrip\` |
| \`lockIcon\` | \`onRenderTooltip\`, \`onRenderIcon\` (\`EditingCell\` renderers only) |

- \`onRenderControl\` gets the default as \`defaultRender\`, so you can fall back to it for some records.
- Every key is optional: what you leave out keeps its default.
- A part is called, not mounted, so it can't use hooks itself. Return a component that does.
- Define \`components\` outside your component, so the cell does not redraw on every render.

{{story: Edit descriptions as rich text}}

## Compose it from the parts

Each part brings one piece of the grid's behaviour, so your cell keeps what you include. The grid's own renderer is these parts in this order:

\`\`\`tsx
<Grid.Cell.Field record={props.data} name={props.colDef.colId}>
    <Grid.Cell.Root {...props}>
        <Grid.Cell.Theme>
            <Grid.Cell.ResizeGrip>
                <Grid.Cell.Container>
                    <Grid.Cell.Loading>
                        <Grid.Cell.Control />
                        <Grid.Cell.Commands />
                        <Grid.Cell.FieldError />
                    </Grid.Cell.Loading>
                </Grid.Cell.Container>
            </Grid.Cell.ResizeGrip>
        </Grid.Cell.Theme>
    </Grid.Cell.Root>
</Grid.Cell.Field>
\`\`\`

| Part | What it brings |
|---|---|
| \`Field\` | Binds the cell to a record's column, for \`useGridField()\`. Leave it out for a column you add. |
| \`Root\` | Makes it a cell and redraws it when the record changes. Required. With the editing module, use \`EditingCell.Root\`, and \`isEditor\` in an editor. |
| \`Theme\` | The cell's colours: zebra rows and colour rules. |
| \`ResizeGrip\` | The grip a row is dragged taller by. |
| \`Container\` | Hover, selection and focus. |
| \`Loading\` | The shimmer while the record loads, in place of what it wraps. |
| \`Control\` | The value, drawn by the column's control. |
| \`Commands\` | The column's \`onGetCommands\`, shown while the row is hovered. |
| \`FieldError\` | The validation outline and its message. |
| \`CellLockIcon\` | The lock, from the editing module. Goes inside \`Loading\`, before the value. |

- Keep this order; any part you leave out is simply not drawn.
- Content of your own takes \`Control\`'s place. Give it \`flex: '1 1 auto'\` and \`minWidth: 0\` so it fills the cell, and the commands, error icon and lock stay at its far edge.

{{story: Forecast the win chance}}

## Reading the cell

| Hook | Returns |
|---|---|
| \`useGridCell()\` | The cell: its record, column, settings, \`isLocked()\`, \`isLoading()\`, \`isBeingEdited()\` and \`render()\` |
| \`useGridField()\` | The field: its value, formatted value, \`isValid()\` and \`setValue(value)\`, which saves with the editing module's \`autoSave\` |

Call them in a component inside the cell, so it redraws when a value changes.
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
                story: `Reuses the grid's cells: \`EditingCell.FieldRenderer\` draws the HTML description (sanitized with DOMPurify) and \`EditingCell.FieldEditor\` edits it in a rich text editor (react-simple-wysiwyg), both through \`control.onRenderControl\`. Double-click a description to try bold, lists and links; the row grows to fit with \`autoHeight\`.`,
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
                story: `Win chance is composed from the parts around a ring gauge, and the grid's features still reach it: zebra rows through \`Theme\`, a Forecast command on hover through \`Commands\`, a shimmer while it forecasts through \`Loading\`, the lock on won and lost deals through \`CellLockIcon\`, and an outline for a chance over 100 through \`FieldError\`. Double-click a chance to edit it with the grid's own editor.`,
            },
        },
    },
}
