import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { RichTextExample, WinChanceExample } from '../../../grid/examples/customComponentsExamples'

const DESCRIPTION = `
A cell draws its value with the control for its column's data type, and that type's editor while the user edits it. When a column needs something else, such as formatted text or a gauge, you replace pieces of its cells or draw the whole cell yourself; either way the cell keeps its theme, validation, loading, commands, lock and resize grip. Try it below: double-click a description and make a word bold.

{{canvas: Edit descriptions as rich text}}

## Changing how it looks

Every column of the provider draws its cells with \`Grid.Cell.Renderer\`, bound to the record's value, and edits them with \`EditingCell.Editor\` while the editing module is on. To change what a column's cells look like, hand those cells new slots through \`cellRendererParams\` and \`cellEditorParams\` in \`colDefs\`, as the example above does; to lay a cell out yourself, give the column a \`cellRenderer\` of your own.

\`cellRendererParams\` and \`cellEditorParams\` take \`components\`, a map of the cell's pieces and their slots, and \`theme\`, a Fluent theme the cell's colours are generated from in place of the grid's own. How slots work is on the DatasetControl's [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview).

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

- To restyle only the value, render \`<GridValueRenderer {...props} components={…} />\` in \`columnControl.onRenderControl\`. Its slots are \`onRenderContainer\`, \`onRenderText\`, \`onRenderPlaceholder\`, \`onRenderLink\`, \`onRenderLookup\`, \`onRenderOptions\`, \`onRenderFile\`, \`onRenderPrefixIcon\` and \`onRenderSuffixIcon\`, with defaults in \`ValueRendererUiComponents\`.
- The editor takes \`container\`, \`loading\`, \`control\`, \`columnControl\` and \`resizeGrip\`; in an editor, \`columnControl\` draws the input.
- Group rows and totals draw their own cells, restyled through their modules: see [**Grouping and totals**](?path=/docs/controls-grid-modules-grouping-and-totals--overview).

## Write a cell of your own

A \`cellRenderer\` of your own is any component that gets AG Grid's cell params, \`IGridCellParams\`. Wrap it in \`Grid.Cell.Field\` to bind it to its column's value, formatting and validation. Inside, render \`Grid.Cell.Renderer\` with \`components\` of its own, or compose the parts as below.

A column you add in \`colDefs\` holds no value of the provider's: draw it with \`Grid.Cell.Renderer\` and no \`Field\`, or with \`Grid.Cell.EmptyRenderer\` for an empty cell. An editor of your own renders \`EditingCell.Editor\` the same way.

## Compose it from the parts

To lay out the cell yourself, compose it from \`Grid.Cell\`'s parts. Each brings one behaviour of a cell, so your cell keeps only what you include. Nest them in this order:

- \`Field\` binds the cell to a record's column, for \`useGridField()\`. Leave it out for a column you add.
- \`Root\` makes it a cell and redraws it when the record changes. Required; in an editor, pass \`takesInput\`.
- \`Theme\` gives the cell its colours: zebra rows and colour rules.
- \`ResizeGrip\` draws the grip a row is dragged taller by.
- \`Container\` fills the cell in the theme's font and text colour.
- \`Loading\` draws the shimmer while the cell waits, in place of what it wraps.
- \`LockIcon\` draws the lock of a locked cell, with the editing module. It goes inside \`Loading\`, before \`Control\`.
- \`Control\` is the room the value is drawn in; the commands, error icon and lock keep to its edge.
- \`ColumnControl\` draws the value: \`GridValueRenderer\`, a PCF control the column names, or your \`onRenderControl\`. It goes inside \`Control\`.
- \`Commands\` draws the column's commands while the row is hovered.
- \`FieldError\` draws the validation outline and its message.

To draw a value of your own, put it inside \`Control\` in place of \`ColumnControl\`, and every other part keeps its place.

{{story: Forecast the win chance}}

## Read the cell

Call these React hooks in a component inside the cell, so it redraws when a value changes:

| Hook | Returns |
|---|---|
| \`useGridCell()\` | The cell: its record, column, context, theme, \`isLocked()\`, \`isLoading()\`, \`isBeingEdited()\` and \`render()\` |
| \`useGridField()\` | The field: its value, formatted value, \`isValid()\` and \`setValue(value)\`, which saves with the editing module's \`autoSave\` |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Custom headers', iconName: 'Header', href: '?path=/docs/controls-grid-appearance-custom-headers--overview', text: 'Add to a column\'s header, or lay it out from its parts.' },
    { title: 'Columns', iconName: 'TripleColumn', href: '?path=/docs/controls-grid-columns--overview', text: 'Add calculated columns and give a column\'s cells commands.' },
    { title: 'Hooks', iconName: 'Plug', href: '?path=/docs/controls-grid-extending-hooks--overview', text: 'Change the control or the parameters of every column\'s cells.' },
]

const meta = {
    title: 'Controls/Grid/Appearance/Custom cells',
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

export const EditDescriptionsAsRichText: Story = {
    name: 'Edit descriptions as rich text',
    render: () => renderStory(<RichTextExample />),
}

export const ForecastTheWinChance: Story = {
    name: 'Forecast the win chance',
    render: () => renderStory(<WinChanceExample />),
    parameters: {
        docs: {
            description: {
                story: `Win chance composed from the parts, with a ring gauge inside \`Control\` in place of \`ColumnControl\`. Try: double-click a chance and enter 120.`,
            },
        },
    },
}
