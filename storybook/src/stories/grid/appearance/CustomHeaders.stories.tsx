import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../form/storyHelpers'
import { gridDocsPage } from '../../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../../grid/showcase/ExploreCards'
import { HeaderCaptionExample, PipelineHeaderExample } from '../../../grid/examples/customComponentsExamples'

const DESCRIPTION = `
A column's header shows the column's name, icons such as a sort arrow, and a menu that opens on click. When a header needs to say more, such as a unit under the name or a total of the column, you replace pieces of it or lay it out yourself; either way it keeps its theme, the icons modules add and the column's menu. Try it below: sort by *Price*.

{{canvas: Add a caption under the name}}

## Changing how it looks

Every column draws its header with \`Grid.ColumnHeader.Renderer\`. To change a column's header, hand it new slots through \`headerComponentParams\` on the column's definition (see *Change a column* on [**Columns**](?path=/docs/controls-grid-columns--overview)), as the example above does; to lay it out yourself, give the column a \`headerComponent\` of your own.

\`headerComponentParams\` take \`components\`, a map of the header's pieces and their slots, and \`theme\`, a Fluent theme the header's colours are generated from in place of the grid's own. How slots work: [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview).

| Key | Slots | Default | Draws |
|---|---|---|---|
| \`container\` | \`onRender\` | | The button the header is, which opens the menu |
| \`prefix\`, \`suffix\` | \`onRender\` | | The icons before and after the name |
| \`content\` | \`onRender\` | | What holds the name and the required marker |
| \`label\` | \`onRender\` | | The column's name |
| \`requiredMarker\` | \`onRender\` | | The \`*\` of a required column |
| \`menu\` | \`onRender\` | | The column's menu |

The icons in \`prefix\` and \`suffix\` are adornments that modules and \`headers.hooks.adornments\` add, and the menu's items come from \`headers.hooks.menuSections\`: see *Extend the header* on [**Columns**](?path=/docs/controls-grid-columns--overview). The checkbox column and the grouping expansion column draw headers of their own: see [**Selection and clipboard**](?path=/docs/controls-grid-modules-selection-and-clipboard--overview) and [**Grouping and totals**](?path=/docs/controls-grid-modules-grouping-and-totals--overview).

## Compose it from the parts

To lay out the header yourself, set \`headerComponent\` to a component that gets AG Grid's header params, \`IColumnHeaderRendererProps\`, and compose it from \`Grid.ColumnHeader\`'s parts. Each brings one behaviour of a header, so your header keeps only what you include:

| Part | Brings |
|---|---|
| \`Root\` | Makes it a column's header. Required, and outermost |
| \`Theme\` | The header's colours, from the \`headers.hooks.theme\` hooks |
| \`Container\` | The button the header is: hover, focus, alignment, and a click that opens the menu |
| \`Prefix\` | The icons before the name |
| \`Content\` | What holds the name and the required marker |
| \`Label\` | The column's name |
| \`RequiredMarker\` | The \`*\` of a required column |
| \`Suffix\` | The icons after the name, such as the sort arrow, the filter and the lock |
| \`Menu\` | The column's menu; beside \`Container\`, not inside it |

Put your own content inside \`Content\`, beside or in place of \`Label\`, so the icons keep their places around it. Read the header with \`useGridColumnHeader()\` in a component inside \`Root\`: it returns the header's name and title, column, context, alignment, \`isRequired()\`, \`getAdornments()\`, \`openMenu()\` and \`closeMenu()\`.

{{story: Sum up the pipeline in the header}}

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Custom cells', iconName: 'TableComputed', href: '?path=/docs/controls-grid-appearance-custom-cells--overview', text: 'Redraw pieces of a column\'s cells, or lay a cell out yourself.' },
    { title: 'Columns', iconName: 'TripleColumn', href: '?path=/docs/controls-grid-columns--overview', text: 'Add adornments and menu sections to a column\'s header.' },
    { title: 'Hooks', iconName: 'Plug', href: '?path=/docs/controls-grid-extending-hooks--overview', text: 'Change every column\'s header and menu from a module.' },
]

const meta = {
    title: 'Controls/Grid/Appearance/Custom headers',
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

export const AHeaderWithACaption: Story = {
    name: 'Add a caption under the name',
    render: () => renderStory(<HeaderCaptionExample />),
}

export const SumUpThePipelineInTheHeader: Story = {
    name: 'Sum up the pipeline in the header',
    render: () => renderStory(<PipelineHeaderExample />),
    parameters: {
        docs: {
            description: {
                story: `Value and Probability composed from the parts, with the column's total or average inside \`Content\`. Try: sort by *Value* from its header.`,
            },
        },
    },
}
