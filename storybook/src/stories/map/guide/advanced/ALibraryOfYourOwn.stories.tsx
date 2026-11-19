import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../map/guide/mapGuide'
import { ALibraryOfYourOwnExample } from '../../../../map/guide/advanced/aLibraryOfYourOwnExamples'

const STEP = 'A library of your own'

const DESCRIPTION = `
{{block: progress}}

The airline's route map from Prague, drawn as an SVG of your own instead of Leaflet.

{{canvas: A library of your own}}

## How it works

This step keeps only \`data.ts\` of the trip and draws the capitals with a map library of its own. In **Code**, the new lines carry \`//new:\`.

**\`Map\` and its library.** \`LeafletMap\` and \`GoogleMap\` are \`Map\` with a library module built in. To draw with another library, use \`Map\` itself: its \`modules\` must hold one named \`library\`, or the map shows *Map needs a library module…* in its place. \`Map\` takes the props of the other two except their library's own, such as \`tileUrl\`, and its \`components\` holds only \`container\`, \`loading\` and \`errorMessage\`.

**The library module** is an \`IMapModule\`, such as \`routeMapLibrary\`:

| Key | Description |
|---|---|
| \`name\` | \`'library'\`. |
| \`onLoad(map, { signal })\` | Returns an \`IMapLibrary\`, whose \`getInstance()\` returns your library's map. It may be async: the map shows its loading state until it resolves, and \`signal\` is aborted if the map unmounts first or another module fails. |
| \`onDestroy(instance)\` | Optional. Called with what \`onLoad\` returned as the map unmounts or mounts again. |
| \`priority\` | Optional. See *A module* on [**Reference**](?path=/docs/controls-map-reference--overview). |

**Drawing the map.** A component in \`Map\`'s children draws your library's map, as \`RouteMapView\` does: a pin at \`map.getPoint(record)\` for each record of \`useMapRecords()\`, each inside \`MapRecordContext.Provider\` with its record, so \`useMapRecord()\` works in it, as it does in the pins of \`LeafletMap\` and \`GoogleMap\`. \`useMapModule('library')\` returns what your module's \`onLoad\` returned, the \`RouteMap\`, where \`RouteMapView\` keeps the SVG that \`getInstance()\` returns.

**The map's view.** The viewport of [**A tour from west to east**](?path=/docs/controls-map-guide-advanced-a-tour-from-west-to-east--overview) fires \`onViewRequested\` on its \`events\` each time the map's view should move, with \`{ center, zoom }\` or \`{ bounds, padding }\`, the padding in pixels. Move your library's map there, as \`toViewBox\` does with two degrees clear in place of the padding, and call \`fit()\` once your map is drawn, for its first view.

**More modules.** A module besides the library declares what its \`onLoad\` returns on \`IMapModuleMap\`, in \`declare module '@talxis/base-controls'\`: see *A module* on [**Reference**](?path=/docs/controls-map-reference--overview).

## Try it

- Hover Vienna's dot: *Vienna*.
- Set \`HOME\` to \`'Lisbon'\`: every route starts in Lisbon.
- In \`data.ts\`, delete Nicosia: the map's view narrows to the rest.
- Change \`modules={[routeMapLibrary]}\` to \`modules={[]}\`: the map shows *Map needs a library module: use GoogleMap or LeafletMap, or give a library module of your own and draw its map as a child.*

## Remember

- \`Map\` and a \`library\` module draw with any library.
- Your component draws each pin inside \`MapRecordContext\`.
- Move your map on \`onViewRequested\`, and call \`fit()\` once it is drawn.

You have seen the whole map. Every prop, member, hook and slot is on [**Reference**](?path=/docs/controls-map-reference--overview).

{{block: navigation}}
`

const meta = {
    title: 'Controls/Map/Guide/Advanced/A library of your own',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { progress: () => <GuideProgress current={STEP} />, navigation: () => <GuideNavigation current={STEP} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ALibraryOfYourOwn: Story = {
    name: 'A library of your own',
    tags: ['!dev'],
    render: () => renderStory(<ALibraryOfYourOwnExample />),
}
