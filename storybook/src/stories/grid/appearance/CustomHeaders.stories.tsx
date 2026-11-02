import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { HeaderCaptionExample, PipelineHeaderExample } from '../../../grid/examples/customComponentsExamples'

const DESCRIPTION = `
Every column draws its header with \`Grid.ColumnHeader.Renderer\`: the column's name, its required marker, the icons modules add, and a menu that opens on click. To change a column's header, hand it new slots through \`headerComponentParams\` in \`colDefs\`; to lay it out yourself, give the column a \`headerComponent\` of your own.

\`\`\`tsx
const CAPTIONED_HEADER: IColumnHeaderRendererComponents = {
    label: { onRenderText: props => <CaptionedLabel {...props} /> },
}

<Grid
    modules={[createClientSideRowModelModule()]}
    colDefs={{ price: { headerComponentParams: { components: CAPTIONED_HEADER } } }} />
\`\`\`

Either way, your header keeps what the grid gives every header: its theme, the icons modules add, and the column's menu.

## Changing how it looks

\`headerComponentParams\` take \`components\`, a map of the header's parts and their slots, and \`theme\`, a Fluent theme the header's colours are generated from in place of the grid's own. How slots work is under *Changing how it looks* on [**Appearance**](?path=/docs/grid-appearance--overview).

{{story: Add a caption under the name}}

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`container\` | \`onRenderButton\` | | The button the header is, which opens the menu |
| \`prefix\`, \`suffix\` | \`onRenderContainer\` | | The icons before and after the name |
| \`content\` | \`onRenderContainer\` | | What holds the name and the required marker |
| \`label\` | \`onRenderText\` | | The column's name |
| \`requiredMarker\` | \`onRenderText\` | | The \`*\` of a required column |
| \`menu\` | \`onRenderContextualMenu\` | | The column's menu |

The icons in \`prefix\` and \`suffix\` are adornments that modules and \`context.header.onGetAdornments\` add, and the menu's items come from \`context.header.onGetMenuSections\`: see *Extend the header* on [**Columns**](?path=/docs/grid-columns--overview). The checkbox column and the grouping expansion column draw headers of their own: see [**Selection and clipboard**](?path=/docs/grid-modules-selection-and-clipboard--overview) and [**Grouping and totals**](?path=/docs/grid-modules-grouping-and-totals--overview).

## Compose it from the parts

To lay out the header yourself, set \`headerComponent\` to a component that gets AG Grid's header params, \`IColumnHeaderRendererProps\`, and compose it from \`Grid.ColumnHeader\`'s parts. Each brings one piece of the grid's behaviour, so the header keeps only what you include:

| Part | What it brings |
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

Put your own content inside \`Content\`, beside or in place of \`Label\`, so the icons keep their places around it. Read the header with \`useGridColumnHeader()\` in a component inside \`Root\`: it returns the header's name and title, column, context, alignment, \`isRequired()\`, \`getAdornments()\`, \`openMenu()\` and \`closeMenu()\`.

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
                story: `\`headerComponentParams\` replace \`label.onRenderText\` to add a unit under the names of Price, In stock and Reorder at, read through \`useGridColumnHeader()\`. Try: sort a column; its arrow still sits beside the name.`,
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
