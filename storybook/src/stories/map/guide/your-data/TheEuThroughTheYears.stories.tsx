import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../map/guide/mapGuide'
import { TheEuThroughTheYearsExample } from '../../../../map/guide/your-data/theEuThroughTheYearsExamples'

const STEP = 'The EU through the years'

const DESCRIPTION = `
{{block: progress}}

A slider shows the EU as it grew from its six founders, and a count under the map follows it.

{{canvas: The EU through the years}}

## How it works

This step starts from the trip map: the map of [**A postcard for each capital**](?path=/docs/controls-map-guide-make-it-yours-a-postcard-for-each-capital--overview), with its pins in *RegionPin.tsx* and its postcard moved to *Postcard.tsx*. In **Code**, the new lines carry \`//new:\`.

**The provider decides the pins.** The map draws a pin for each record of its provider that has a position. To change the pins, change the provider: filter it and refresh it, as \`onYearChange\` does, and once it has loaded, the pins and the map's view follow. How filtering works is on [**Data providers**](?path=/docs/concepts-data-providers--overview).

**Children.** Components of yours go in the map as its \`children\`. Once the map has loaded its modules, they are drawn in the map's box, under the library's map and one under another, and the map takes the height they leave. Inside them the hooks reach the map, as they do in a pin or a popup.

**\`useMapRecords()\`** returns the records that have a pin, and draws the component again each time the provider loads new data, so \`MemberCount\` follows the slider.

## Try it

- Drag the slider to 1958: six pins are left, *6 member states*, and the map's view closes in on the founders.
- Stop at 2004: *24 member states*.
- At 2004, open Valletta's pin: *In the EU since 2004*.
- Change \`Operators.LessThanOrEqual\` to \`Operators.Equal\` and drag the slider to 2004: the ten capitals that joined that year.

## Remember

- The provider decides the pins.
- Children are drawn under the map, where the hooks reach it.
- \`useMapRecords()\` draws again on every load.

{{block: navigation}}
`

const meta = {
    title: 'Controls/Map/Guide/Your data/The EU through the years',
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

export const TheEuThroughTheYears: Story = {
    name: 'The EU through the years',
    tags: ['!dev'],
    render: () => renderStory(<TheEuThroughTheYearsExample />),
}
