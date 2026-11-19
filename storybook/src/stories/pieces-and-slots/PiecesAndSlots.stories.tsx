import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { PiecesAndSlotsExample, PlainUiExample } from './piecesAndSlotsExamples'

const DESCRIPTION = `
Every part of a control draws its UI through small functions you can replace, so you can change one button or one text without rewriting the part, and the part keeps its behaviour. You hand the replacements to the part in its \`components\` map, and anything you leave out keeps its default. Try it below: press **Mount again** to watch the replaced loading state, then hover a command.

{{canvas: Replace what the ribbon draws}}

## Slots

A *slot* is a function named \`onRender…\`. It gets the props its default draws with and returns an element, or \`null\`. A part's own slots sit directly in its \`components\` map, and the slot that draws a part's outermost element is named \`onRender\`, as in the example.

Most defaults are exported, named after the UI they belong to, such as \`RibbonUiCommandBarComponents\` or \`LoadingBoundaryComponents\`, so a slot can still draw the default:

| To | Write |
|---|---|
| Change one prop | \`props => RibbonUiCommandBarComponents.onRender({ ...props, align: 'end' })\` |
| Wrap it | \`props => <div title='Commands'>{RibbonUiCommandBarComponents.onRender(props)}</div>\` |
| Replace it | \`props => <SearchBox {...props} />\` |
| Remove it | \`() => null\` |

Spread the props you get: they carry the class names, handlers and refs that make the part work. A slot is called during render, so to call \`useState\` or another \`use…\` function there, return a component of your own: \`props => <MyViewButton {...props} />\`.

## Pieces

A *piece* is a key in the \`components\` map that names something inside the part and holds that thing's slots, as \`commandBar\` and \`shimmer\` do in the example. A piece merges over its default slot by slot, so a slot you leave out keeps its default.

A control with a guide lists its pieces and slots under *Slots* on its Reference: DatasetControl's [**Reference**](?path=/docs/controls-datasetcontrol-reference--overview), Grid's [**Reference**](?path=/docs/controls-grid-reference--overview), TaskGrid's [**Reference**](?path=/docs/controls-taskgrid-reference--overview) and Map's [**Reference**](?path=/docs/controls-map-reference--overview). Every other control lists them under *Changing how it looks* on its own page.

## What slots do not change

A slot changes how something looks, not what it holds. Commands and menu items are added through the part, with \`hooks.commands\`, \`hooks.items\` or \`hooks.columnCommands\`: see *Each part from your code* on DatasetControl's [**Reference**](?path=/docs/controls-datasetcontrol-reference--overview) and *Add your own commands* on [**Ribbon**](?path=/docs/controls-ribbon-get-started--overview).

## Parts without a control

Every part is split in two. The *UI* takes plain props and owns the look: its styles and its \`components\`. The *adapter* reads the control and draws the UI with props, texts included. As the UI never reads the control, it also draws from your own state, with no control behind it.

{{story: Plain UI}}

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Your own UI', iconName: 'GridViewSmall', href: '?path=/docs/controls-datasetcontrol-guide-advanced-your-own-ui--overview', text: 'Pieces and parts of your own in a DatasetControl.' },
    { title: 'Cells and headers of your own', iconName: 'Edit', href: '?path=/docs/controls-grid-guide-make-it-yours-cells-and-headers-of-your-own--overview', text: 'Replace what the grid\'s cells and headers draw.' },
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

export const PlainUi: Story = {
    name: 'Plain UI',
    render: () => renderStory(<PlainUiExample />),
    parameters: {
        docs: {
            description: {
                story: `The DatasetControl's frame and view switcher, with the form's sections as cards, all drawn from React state. Try: set a deal's stage to **Won**, then switch to **Won deals**.`,
            },
        },
    },
}
