import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { OwnLibraryExample } from './mapExamples'

const DESCRIPTION = `
When neither Leaflet nor Google Maps fits, such as for another map service or a drawing of your own, the map can be drawn by a library you write. It is a module the map loads, which hands out the library's own map and adds a component that draws the pins and moves the view when the map asks for it. Try it below: open **Code** and add Kyiv, at 50.4501, 30.5234, to \`data.ts\`.

{{canvas: A map drawn as dots}}

## The module

The module is an \`IMapModule\` named \`library\`. Its \`onLoad(map)\` returns an \`IMapLibrary\`: an object whose \`getInstance()\` returns the library's own map once it is drawn. The map loads only with one module named \`library\`. The library adds its component to the map's box with \`map.surfaces.hooks.surfaces.add(hook)\`, pushing \`{ key, onRender }\`, as \`DotMapRuntime\` does.

## The component

The component is what the library's surface draws, as \`DotMap\` is in \`DotMap.tsx\`:

| To | Use |
|---|---|
| Reach the map and the library | \`useMap()\` and \`useMapModule('library')\` |
| Draw the pins | \`useMapRecords()\`, with \`map.getPoint(record)\` for where each goes |
| Move the view when the map asks | \`map.services.get('viewport')\`: listen to \`onViewRequested\` on its \`events\`, and call \`fit()\` once the library can move, for the records already loaded |

A request is \`{ center, zoom }\` or \`{ bounds, padding }\`, with \`bounds\` as \`{ north, south, east, west }\` and \`padding\` in pixels. Zoom counts as tiled maps count it: at \`0\` the world is 256 pixels wide, and each step doubles that. The map asks as *Where the map looks* on [**Map**](?path=/docs/controls-map-get-started--overview) describes.

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Map libraries', iconName: 'MapLayers', href: '?path=/docs/controls-map-map-libraries--overview', text: 'The two libraries that come with the package.' },
    { title: 'Talking to the map', iconName: 'Plug', href: '?path=/docs/controls-map-talking-to-the-map--overview', text: 'Everything the map offers your code.' },
    { title: 'Your own UI', iconName: 'Edit', href: '?path=/docs/controls-map-your-own-ui--overview', text: 'Draw your own pins on a shipped library.' },
]

const meta = {
    title: 'Controls/Map/Write a library',
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

export const AMapDrawnAsDots: Story = {
    name: 'A map drawn as dots',
    render: () => renderStory(<OwnLibraryExample />),
}
