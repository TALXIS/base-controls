import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../map/guide/mapGuide'
import { PinsColouredByRegionExample } from '../../../../map/guide/make-it-yours/pinsColouredByRegionExamples'

const STEP = 'Pins coloured by region'

const DESCRIPTION = `
{{block: progress}}

Each pin takes the colour of its capital's region, and the largest capitals carry a star.

{{canvas: Pins coloured by region}}

## How it works

This step draws the pins of [**Your first map**](?path=/docs/controls-map-guide-basics-your-first-map--overview) your way. *data.ts* adds each capital's \`population\` and \`region\`, and the regions as an option set, \`REGIONS\`, with a colour for each. In **Code**, the new lines carry \`//new:\`.

**Pieces.** \`components\` on \`LeafletMap\` and \`GoogleMap\` holds the map's pieces, each with slots of its own; \`Map\` itself, which [**A library of your own**](?path=/docs/controls-map-guide-advanced-a-library-of-your-own--overview) uses, takes only \`container\`, \`loading\` and \`errorMessage\`. How slots work is on [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview), and every slot is under *Slots* on [**Reference**](?path=/docs/controls-map-reference--overview).

| Piece | Draws |
|---|---|
| \`container\`, \`loading\`, \`errorMessage\` | The map's box, its loading state and a failed load. |
| \`map\` | The library's map: Leaflet's with its tiles, or Google's. |
| \`marker.pin\` | Each pin. |
| \`marker.popup\` | The popup a pin opens, as [**A postcard for each capital**](?path=/docs/controls-map-guide-make-it-yours-a-postcard-for-each-capital--overview) shows. |

**The pin's slots.** \`REGION_PINS\` replaces two of the three slots under \`marker.pin\`:

| Slot | Draws |
|---|---|
| \`onRender\` | The pin's box, 32 by 40 pixels, whose bottom centre sits on the capital's position. |
| \`onRenderPin\` | The teardrop, in the theme's primary colour; hand \`Map.Ui.MarkerPin\` a \`color\` to fill it. |
| \`onRenderDot\` | The dot in the teardrop. |

**The pin's record.** A slot under \`marker\` is drawn inside its pin, so a component in it reads the pin's record with \`useMapRecord()\`, which throws outside a pin. \`region\` is an option set, whose value \`getValue()\` returns as a string, so \`RegionPin\` compares \`Number(capital.getValue('region'))\`. Pass the props a slot gets on to what you draw, as \`RegionPin\` does; \`CapitalDot\` passes them to the dot it keeps, and the star needs none.

**\`Map.Ui.MarkerPin\`** draws the teardrop as plain UI, in its \`color\` or the theme's primary colour. The teardrop is turned 45 degrees, so \`CapitalDot\` turns the star back. The rest of the map's plain UI is on [**Reference**](?path=/docs/controls-map-reference--overview).

## Try it

- Five pins carry a star: Berlin, Madrid, Paris, Rome and Vienna.
- Change \`2000000\` to \`1000000\`: eleven pins carry one.
- In *data.ts*, set Eastern Europe's \`Color\` to \`'#d13438'\`: six pins turn red, Prague's among them.
- Delete the \`onRenderDot\` line: every pin has its dot again.

## Remember

- The slots under \`marker.pin\` draw each pin.
- A component in a slot reads its pin's record with \`useMapRecord()\`.
- Pass the props a slot gets on to what you draw.

{{block: navigation}}
`

const meta = {
    title: 'Controls/Map/Guide/Make it yours/Pins coloured by region',
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

export const PinsColouredByRegion: Story = {
    name: 'Pins coloured by region',
    tags: ['!dev'],
    render: () => renderStory(<PinsColouredByRegionExample />),
}
