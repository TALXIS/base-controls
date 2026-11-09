import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { LayoutExample } from './mapExamples'

const DESCRIPTION = `
A map has no height of its own to grow to, the way a list grows with its rows, so it takes the space its parent gives it: the free space of a flex layout, or the height of a parent that has one. Give its parent a height, or put it in a flex layout, and it fills that space; when the space changes, the map redraws to fit. Try it below: drag **Container height**.

{{canvas: Fill a flex layout}}

## Size the map

\`height\` sizes the map's box.

| \`height\` | The map |
|---|---|
| Left out | Fills its parent: the free space of a flex parent, along its direction, or the height of any other parent that has one. Never shorter than 200px, so a parent without a height still shows a map. |
| A length, such as \`'480px'\` | Exactly that tall, whatever its parent. |

Children you put in the map stack under the library's map, which takes the height they leave.

## Fill a flex layout

The example's panel is a flex column whose height the slider sets, and the map is all it holds. The map needs no \`height\` for this: left out, it is \`flex: 1 1 auto\`, so it takes the panel's whole height and follows it as the slider moves. Beside a list or under a toolbar in the same column or row, it would take only the space they leave.

## Good to know

- In a \`DatasetControl\` with a \`height\`, the map in its body takes the height the header and the footer leave, as a grid does: see [**In a DatasetControl**](?path=/docs/controls-map-in-a-datasetcontrol--overview).
- \`className\` adds a class to the map's box, such as a border or a margin; its size is better left to \`height\` and to the parent.

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Map', iconName: 'MapPin', href: '?path=/docs/controls-map-get-started--overview', text: 'The props, and where the map looks.' },
    { title: 'In a DatasetControl', iconName: 'Table', href: '?path=/docs/controls-map-in-a-datasetcontrol--overview', text: 'The map as the body of a DatasetControl, with its views and ribbon.' },
    { title: 'Layout', iconName: 'GridViewMedium', href: '?path=/docs/concepts-layout--overview', text: 'How the controls size themselves and turn compact.' },
]

const meta = {
    title: 'Controls/Map/Layout',
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

export const FillAFlexLayout: Story = {
    name: 'Fill a flex layout',
    render: () => renderStory(<LayoutExample />),
}
