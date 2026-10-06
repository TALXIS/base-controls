import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { HeaderCaptionExample } from '../../../grid/examples/customComponentsExamples'

const DESCRIPTION = `
A column's header is drawn by its \`headerComponent\`, set through \`colDefs\`. As with cells, reuse the grid's header and change parts of it through \`components\`, or build one from its parts.

## Reusing the grid's header

\`\`\`tsx
const CaptionedHeader = (props: IColumnHeaderRendererProps) => <Grid.ColumnHeader.Renderer {...props} components={CAPTIONED_HEADER} />

colDefs={{ price: { headerComponent: CaptionedHeader } }}
\`\`\`

| \`components\` key | Parts | What it draws |
|---|---|---|
| \`label\` | \`onRenderText\` | The column's name |
| \`requiredMarker\` | \`onRenderText\` | The \`*\` of a required column |
| \`prefix\`, \`suffix\` | \`onRenderContainer\` | What modules draw before and after the name |
| \`container\` | \`onRenderButton\` | The header button that opens the menu |
| \`content\` | \`onRenderContainer\` | What holds the name and the required marker |
| \`menu\` | \`onRenderContextualMenu\` | The column's menu |

{{story: A header with a caption}}

## Building a header from its parts

\`Grid.ColumnHeader.Renderer\` is \`Root\` > \`Theme\` > \`Container\` > (\`Prefix\`, \`Content\` > (\`Label\`, \`RequiredMarker\`), \`Suffix\`), with \`Menu\` beside \`Container\`. Build your own from the same parts, with \`Grid.ColumnHeader.Root\` first. Inside it, \`useGridColumnHeader()\` returns the header: its name, column, settings, \`openMenu()\` and \`closeMenu()\`.
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
                story: `\`label.onRenderText\` adds a caption under the Price name, read through \`useGridColumnHeader()\`. Sorting still puts its arrow beside the name.`,
            },
        },
    },
}
