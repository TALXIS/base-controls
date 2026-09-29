import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { CustomCellExample, CustomHeaderExample, EmptyStateExample, LoadingOverlayExample, LoadingRowsExample, ModuleUiExample } from '../../../grid/examples/customComponentsExamples'

const DESCRIPTION = `
Everything the grid draws is built from parts you can replace. Every part has a \`components\` prop, and every entry in it is an \`onRender…\` function that draws one piece. Return your own element, or render the default with changed props.

| What | Where you replace it | Its pieces |
|---|---|---|
| A cell | \`colDef.cellRenderer\`, with \`Grid.Cell.FieldRenderer\` or \`Grid.Cell.Renderer\` | \`components.control\`, \`container\`, \`loading\`, \`commands\`, \`validation\` |
| A header | \`colDef.headerComponent\`, with \`Grid.ColumnHeader.Renderer\` | \`components.label\`, \`container\`, \`prefix\`, \`suffix\`, \`menu\`, \`requiredMarker\` |
| The loading overlay | \`components.onRenderLoadingOverlay\` on \`<Grid.Root />\` | \`Grid.Overlay.Ui.Loading\`: \`onRenderContainer\`, \`onRenderSpinner\`, \`onRenderText\` |
| The empty state | \`components.onRenderEmptyRecordsOverlay\` on \`<Grid.Root />\` | \`Grid.Overlay.Ui.EmptyRecords\`: \`onRenderContainer\`, \`onRenderIcon\`, \`onRenderText\` |
| A loading row | \`components.onRenderRowLoading\` on \`<Grid.Root />\` | \`Grid.Row.Ui.Loading\`: \`onRenderShimmer\` |
| A failed row | \`components.onRenderRowError\` on \`<Grid.Root />\` | \`Grid.Row.Ui.Error\`: \`onRenderMessageBar\` |
| A module's UI | the module's \`components\` option | for example \`onRenderSortIcon\`, \`onRenderFilterIcon\`, \`onRenderGroupCell\`, \`onRenderTotalCell\` |

\`Grid.Cell\`, \`Grid.ColumnHeader\`, \`Grid.Overlay\` and \`Grid.Row\` also hold the parts themselves, so a component of your own can be put together from them.
`

const meta = {
    title: 'Grid/Customizations/Custom Components',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
            description: { component: DESCRIPTION },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const CustomCell: Story = {
    name: 'Custom cell',
    render: () => renderStory(<CustomCellExample />),
    parameters: {
        docs: {
            description: {
                story: `\`onRenderControl\` is handed the default as \`defaultRender\`: won deals draw a badge, the rest draw as before.`,
            },
        },
    },
}

export const CustomHeader: Story = {
    name: 'Custom header',
    render: () => renderStory(<CustomHeaderExample />),
    parameters: {
        docs: {
            description: {
                story: `The **Value** header draws an icon before its name. Sorting still works: only the label was replaced.`,
            },
        },
    },
}

export const EmptyState: Story = {
    name: 'Empty state',
    render: () => renderStory(<EmptyStateExample />),
}

export const LoadingOverlay: Story = {
    name: 'Loading overlay',
    render: () => renderStory(<LoadingOverlayExample />),
    parameters: {
        docs: {
            description: {
                story: `The provider in this example never finishes loading, so the overlay stays up. \`message\` is the provider's loading message.`,
            },
        },
    },
}

export const LoadingRows: Story = {
    name: 'Loading rows',
    render: () => renderStory(<LoadingRowsExample />),
    parameters: {
        docs: {
            description: {
                story: `What a row shows while its records are on the way. The small module at the top only keeps the rows loading, so there is something to look at.`,
            },
        },
    },
}

export const ModuleUi: Story = {
    name: 'Module UI',
    render: () => renderStory(<ModuleUiExample />),
    parameters: {
        docs: {
            description: {
                story: `The sorting and filtering modules with icons of their own. Sort or filter a column to see them.`,
            },
        },
    },
}
