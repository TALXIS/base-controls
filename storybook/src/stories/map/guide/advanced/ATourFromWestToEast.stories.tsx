import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../map/guide/mapGuide'
import { ATourFromWestToEastExample } from '../../../../map/guide/advanced/aTourFromWestToEastExamples'

const STEP = 'A tour from west to east'

const DESCRIPTION = `
{{block: progress}}

Two buttons under the map fly from capital to capital, west to east, and show them all again.

{{canvas: A tour from west to east}}

## How it works

This step starts again from the trip map of [**The EU through the years**](?path=/docs/controls-map-guide-your-data-the-eu-through-the-years--overview), without its slider and count, and adds \`Tour\` as a child of the map. In **Code**, the new lines carry \`//new:\`.

**From inside the map.** A child of the map reaches it with \`useMap()\`, as the boarding pass of [**A boarding pass from Prague**](?path=/docs/controls-map-guide-make-it-yours-a-boarding-pass-from-prague--overview) does, and reaches one of its modules with \`useMapModule(name)\`, which throws when that module is not loaded. \`useMapModule('library')\` returns the library module, here Leaflet's.

**From outside the map.** The map's props hand your code the map, an \`IMap\`. \`onSetup(map)\` and \`onReady(map)\` work as [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview) describes, and a new \`key\` mounts a new map. \`onLoad(map)\` is the map's own: it runs once the modules have loaded, and the map shows its loading state until a promise it returns settles.

| Member of the map | Description |
|---|---|
| \`getPoint(record)\` | Where the record's pin goes, as \`{ latitude, longitude }\`, or \`undefined\`, as *A boarding pass from Prague* says. |
| \`modules\` | The modules the map loaded, by name: \`modules.get('library')\` is the library module, as \`useMapModule('library')\` returns it. |
| \`services\` | \`get('provider')\`, the provider whose records the map draws, and \`get('viewport')\`, the viewport below. |
| \`lifecycle\`, \`loading\`, \`execute\`, \`parts\`, \`notifications\` | What every control on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview) has: the mount's status and events, a cover over the map's box, actions whose errors the map shows, the parts drawn in it, and its messages. |

**The viewport** works out the map's view and asks the library to move there. Its \`fit()\` moves the map's view to the current pins, as **Show all** does, and \`getView()\` returns that view without moving, or \`undefined\` while there are no pins. Which view it picks is on [**Your first map**](?path=/docs/controls-map-guide-basics-your-first-map--overview).

**The library's own map.** \`getInstance()\` on the library module returns the library's map once it is drawn, and \`undefined\` before: a Leaflet \`Map\` for \`ILeaflet\`, whose \`flyTo\` \`Tour\` calls, or a \`google.maps.Map\` for \`IGoogleMaps\`. Anything the library offers is then yours. On the module's \`events\`, \`onInstanceReady\` fires with the library's map as it is drawn; \`IGoogleMaps\` also fires \`onPopupChanged\` with the record id of the open popup, or \`undefined\` once it closes.

## Try it

- Press **Next capital** three times: Lisbon, Dublin, then Madrid.
- Press **Show all**: every capital is in the map's view again.
- Change \`flyTo\` to \`setView\`: the map jumps instead of flying.
- Swap \`a\` and \`b\` in the sort: the tour starts in Nicosia.

## Remember

- Inside the map, \`useMap()\` hands you the map, as in \`Tour\`; the props hand it to code outside.
- The viewport moves the map's view to the pins.
- \`getInstance()\` hands you the library's own map.

{{block: navigation}}
`

const meta = {
    title: 'Controls/Map/Guide/Advanced/A tour from west to east',
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

export const ATourFromWestToEast: Story = {
    name: 'A tour from west to east',
    tags: ['!dev'],
    render: () => renderStory(<ATourFromWestToEastExample />),
}
