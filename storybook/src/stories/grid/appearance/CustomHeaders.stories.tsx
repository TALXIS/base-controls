import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { HeaderCaptionExample, PipelineHeaderExample } from '../../../grid/examples/customComponentsExamples'

const DESCRIPTION = `
Every column draws its header with the grid's own header: the column's name, its required marker, the icons modules add, and a menu that opens on click. When a column needs something else, give it a header of your own with \`headerComponent\` in \`colDefs\`.

\`\`\`tsx
<DatasetControl onLoad={loadProducts}>
    <DatasetControl.Body>
        <Grid
            modules={[createClientSideRowModelModule()]}
            colDefs={{ price: { headerComponent: CaptionedHeader } }} />
    </DatasetControl.Body>
</DatasetControl>
\`\`\`

Either way you build it, your header keeps what the grid gives every header: its theme, the icons modules add, and the column's menu.

## Reuse the grid's header

Render \`Grid.ColumnHeader.Renderer\` and replace the parts you need through \`components\`.

{{story: Add a caption under the name}}

| Key | Parts | Description |
|---|---|---|
| \`label\` | \`onRenderText\` | The column's name. |
| \`requiredMarker\` | \`onRenderText\` | The \`*\` of a required column. |
| \`prefix\`, \`suffix\` | \`onRenderContainer\` | The icons before and after the name. |
| \`content\` | \`onRenderContainer\` | What holds the name and the required marker. |
| \`container\` | \`onRenderButton\` | The button the header is, which opens the menu. |
| \`menu\` | \`onRenderContextualMenu\` | The column's menu. |

The parts follow the \`components\` rules. See *Replace what the grid draws* on [**Appearance**](?path=/docs/grid-appearance--overview).

## Compose it from the parts

When you want to lay out the header yourself, compose it from \`Grid.ColumnHeader\`'s parts. Each brings one piece of the grid's behaviour, so the header keeps only what you include. List them in this order:

| Part | Description |
|---|---|
| \`Root\` | Makes it a column's header. Required, and outermost. |
| \`Theme\` | The header's colours, from \`context.header.onGetTheme\` and theme hooks. |
| \`Container\` | The button the header is: hover, focus, alignment, and a click that opens the menu. |
| \`Prefix\` | The icons drawn before the name. |
| \`Content\` | What holds the name and the required marker. |
| \`Label\` | The column's name. |
| \`RequiredMarker\` | The \`*\` of a required column. |
| \`Suffix\` | The icons drawn after the name, such as the sort arrow, the filter and the lock. |
| \`Menu\` | The column's menu. Goes beside \`Container\`, not inside it. |

Put your own content inside \`Content\`, beside or in place of \`Label\`, so the icons keep their places around it. Read the header with the React hook \`useGridColumnHeader()\` in a component inside \`Root\`: it returns the header's name and title, column, context, alignment, \`isRequired()\`, \`getAdornments()\`, \`openMenu()\` and \`closeMenu()\`.

{{story: Sum up the pipeline in the header}}
`

const meta = {
    title: 'Grid/Appearance/Custom headers',
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

export const AHeaderWithACaption: Story = {
    name: 'Add a caption under the name',
    render: () => renderStory(<HeaderCaptionExample />),
    parameters: {
        docs: {
            description: {
                story: `\`label.onRenderText\` adds a unit under the names of Price, In stock and Reorder at, read through \`useGridColumnHeader()\`. Try: sort a column; its arrow still sits beside the name.`,
            },
        },
    },
}

export const SumUpThePipelineInTheHeader: Story = {
    name: 'Sum up the pipeline in the header',
    render: () => renderStory(<PipelineHeaderExample />),
    parameters: {
        docs: {
            description: {
                story: `Value and Probability composed from the parts, with the column's total or average inside \`Content\`, calculated with \`TotalRow\` from \`@talxis/client-libraries\`. Try: sort either column from its header; \`Suffix\` and \`Menu\` still work.`,
            },
        },
    },
}
