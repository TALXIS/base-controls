import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../map/guide/mapGuide'
import { ABoardingPassFromPragueExample } from '../../../../map/guide/make-it-yours/aBoardingPassFromPragueExamples'

const STEP = 'A boarding pass from Prague'

const DESCRIPTION = `
{{block: progress}}

From Prague, each pin opens a boarding pass with the distance and the flight time.

{{canvas: A boarding pass from Prague}}

## How it works

The pins are those of *RegionPin.tsx*, and the boarding pass takes the place of the postcard of [**A postcard for each capital**](?path=/docs/controls-map-guide-make-it-yours-a-postcard-for-each-capital--overview). In **Code**, the new lines carry \`//new:\`.

**A popup all your own.** \`marker.popup.onRender\` may return anything, not only the popup parts. The bubble keeps its shadow, corners and background, and what is inside it is yours: here, a pass in the colour of the capital's region.

**The map.** \`useMap()\` returns the map the component is inside, and throws outside one. Its \`getPoint(record)\` returns where a record's pin goes, as \`{ latitude, longitude }\`, or \`undefined\` when the record's position is not a number; \`BoardingPass\` works out the distance from the points of Prague and of the pin's capital. The rest of the map is on [**A tour from west to east**](?path=/docs/controls-map-guide-advanced-a-tour-from-west-to-east--overview).

**Prague.** \`useMapRecords()\` returns the records that have a pin, among them Prague; [**The EU through the years**](?path=/docs/controls-map-guide-your-data-the-eu-through-the-years--overview) has more on it.

**The theme.** \`useTheme()\` from the package returns your app's theme, so the pass follows it as the bubble does; the tiles stay as the tile service draws them, as [**Pick the tiles**](?path=/docs/controls-map-guide-basics-pick-the-tiles--overview) says. How themes work is on [**Theming**](?path=/docs/concepts-theming--overview).

## Try it

- Open Lisbon's pin: *PRA* to *LIS*, 2,244 km, 3h 18m. The number format follows the browser's language.
- Open Helsinki's: 1,303 km, 2h 8m.
- Set \`HOME\` to \`'Vienna'\`: every pass starts at *VIE*, and Lisbon is 2,298 km away.
- Set the theme in Storybook's toolbar to **Dark** and open a pin: the pass and its bubble turn dark, and the tiles stay light.

## Remember

- A popup can be anything.
- \`useMapRecord()\` and \`useMap()\` hand a popup its pin's record and the map.
- \`useTheme()\` keeps a popup in your app's colours.

Your pins and popups tell the trip. *Your data* lets your records decide what the map shows.

{{block: navigation}}
`

const meta = {
    title: 'Controls/Map/Guide/Make it yours/A boarding pass from Prague',
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

export const ABoardingPassFromPrague: Story = {
    name: 'A boarding pass from Prague',
    tags: ['!dev'],
    render: () => renderStory(<ABoardingPassFromPragueExample />),
}
