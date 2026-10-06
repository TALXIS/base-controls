import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { HeaderCaptionExample, PipelineHeaderExample } from '../../../grid/examples/customComponentsExamples'

const DESCRIPTION = `
Every column draws its header with the grid's own header: the column's name, its required marker, the icons modules add, and a menu that opens on click. When a column needs something else, give it a header of your own: set \`headerComponent\` in \`colDefs\`.

\`\`\`tsx
<Grid.Root
    provider={provider}
    modules={{ rowModel: createClientSideRowModelModule() }}
    colDefs={{ price: { headerComponent: CaptionedHeader } }} />
\`\`\`

You build that header one of two ways:

1. **Reuse the grid's header** and replace the parts you need through \`components\`.
2. **Compose it from the parts**, when you want to lay out the header yourself.

Either way it keeps what the grid gives every header: its theme, the icons modules add, and the column's menu.

## 1. Reuse the grid's header

Render \`Grid.ColumnHeader.Renderer\` and pass \`components\`:

| Key | Parts | What it draws |
|---|---|---|
| \`label\` | \`onRenderText\` | The column's name |
| \`requiredMarker\` | \`onRenderText\` | The \`*\` of a required column |
| \`prefix\`, \`suffix\` | \`onRenderContainer\` | The icons before and after the name |
| \`content\` | \`onRenderContainer\` | What holds the name and the required marker |
| \`container\` | \`onRenderButton\` | The button the header is, which opens the menu |
| \`menu\` | \`onRenderContextualMenu\` | The column's menu |

- Every key is optional: what you leave out keeps its default.
- A part is called, not mounted, so it can't use hooks itself. Return a component that does.
- Define \`components\` outside your component, so the header does not redraw on every render.

{{story: A header with a caption}}

## 2. Compose it from the parts

Each part brings one piece of the grid's behaviour, so your header keeps what you include. List them in this order:

| Part | What it brings |
|---|---|
| \`Root\` | Makes it a column's header. Required, and outermost. |
| \`Theme\` | The header's colours, from \`settings.header.onGetTheme\` and theme hooks. |
| \`Container\` | The button the header is: hover, focus, alignment, and a click that opens the menu. |
| \`Prefix\` | The icons drawn before the name. |
| \`Content\` | What holds the name and the required marker. |
| \`Label\` | The column's name. |
| \`RequiredMarker\` | The \`*\` of a required column. |
| \`Suffix\` | The icons drawn after the name, such as the sort arrow, the filter and the lock. |
| \`Menu\` | The column's menu. Goes beside \`Container\`, not inside it. |

- Keep this order; any part you leave out is simply not drawn.
- Put your own content inside \`Content\`, beside or in place of \`Label\`, so the icons keep their places around it.

### Reading the header

| Hook | Returns |
|---|---|
| \`useGridColumnHeader()\` | The header: its name and title, column, settings, alignment, \`isRequired()\`, \`getAdornments()\`, \`openMenu()\` and \`closeMenu()\` |

Call it in a component inside \`Root\`.

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
    name: 'A header with a caption',
    render: () => renderStory(<HeaderCaptionExample />),
    parameters: {
        docs: {
            description: {
                story: `\`label.onRenderText\` adds a unit under the names of Price, In stock and Reorder at, read through \`useGridColumnHeader()\`. Sort a column: its arrow still sits beside the name.`,
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
                story: `Value and Probability are composed from the parts, with the column's total or average under the name inside \`Content\`. \`Suffix\` still draws the sort arrow and \`Menu\` still opens on click: sort either column from its header.`,
            },
        },
    },
}
