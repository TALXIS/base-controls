import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { PiecesAndSlotsExample } from './piecesAndSlotsExamples'

const DESCRIPTION = `
Every part of a control draws its UI through small functions you can replace, so you can change one button or one text without rewriting the part, and the part keeps its behaviour. You hand the replacements to the part in its \`components\` map, and anything you leave out keeps its default. Try it below: press **Mount again** to watch the replaced loading state, then hover a command.

{{canvas: Replace what the ribbon draws}}

## Slots

A *slot* is a function named \`onRender…\`. It gets the props its default draws with and returns an element, or \`null\`. A part's own slots sit directly in its \`components\` map, as the ribbon's \`onRenderCommandBar\` does in the example.

Most defaults are exported, named after the UI they belong to, such as \`RibbonUiCommandBarComponents\` or \`LoadingBoundaryComponents\`, so a slot can still draw the default:

| To | Write |
|---|---|
| Change one prop of the default | \`props => RibbonUiCommandBarComponents.onRenderCommandBar({ ...props, align: 'end' })\` |
| Wrap the default | \`props => <TooltipHost content='Views'>{DatasetControlUiViewSwitcherComponents.onRenderButton(props)}</TooltipHost>\` |
| Replace it | \`props => <SearchBox {...props} />\` |
| Remove it | \`() => null\` |

Spread the props you get: they carry the class names, handlers and refs that make the part work. A slot is called during render, so to use hooks there, return a component of your own: \`props => <MyViewButton {...props} />\`.

## Pieces

A *piece* is a key in the \`components\` map that names something inside the part and holds that thing's slots, as \`shimmer\` does in the example. A piece merges over its default slot by slot, so a slot you leave out keeps its default.

Each control lists its pieces and slots under *Changing how it looks*, or for DatasetControl under *Reference* on [**Your own UI**](?path=/docs/controls-datasetcontrol-your-own-ui--overview).

## What slots do not change

A slot changes how something looks, not what it holds. Commands and menu items are added through the part, with \`addCommandsHook\`, \`addItemsHook\` or \`addColumnCommandsHook\`: see [**Talking to the control**](?path=/docs/controls-datasetcontrol-talking-to-the-control--overview) and *Add your own commands* on [**Ribbon**](?path=/docs/controls-ribbon-get-started--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Your own UI', iconName: 'GridViewSmall', href: '?path=/docs/controls-datasetcontrol-your-own-ui--overview', text: 'Every slot of DatasetControl, and parts of your own.' },
    { title: 'Appearance', iconName: 'Color', href: '?path=/docs/controls-grid-appearance--overview', text: 'Replace the grid\'s cells, headers and overlays.' },
    { title: 'Fluent UI', iconName: 'Design', href: '?path=/docs/concepts-fluent-ui--overview', text: 'The Fluent components the defaults draw with.' },
]

const meta = {
    title: 'Concepts/Pieces and slots',
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

export const ReplaceWhatTheRibbonDraws: Story = {
    name: 'Replace what the ribbon draws',
    render: () => renderStory(<PiecesAndSlotsExample />),
}
