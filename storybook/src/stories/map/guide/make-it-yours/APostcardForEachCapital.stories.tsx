import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../map/guide/mapGuide'
import { APostcardForEachCapitalExample } from '../../../../map/guide/make-it-yours/aPostcardForEachCapitalExamples'

const STEP = 'A postcard for each capital'

const DESCRIPTION = `
{{block: progress}}

A pin opens a postcard: the capital's region, its country, the year it joined and how it compares to the largest.

{{canvas: A postcard for each capital}}

## How it works

The pins of [**Pins coloured by region**](?path=/docs/controls-map-guide-make-it-yours-pins-coloured-by-region--overview) move to *RegionPin.tsx* as they were, and \`data.ts\` adds each capital's \`country\` and \`euSince\`. In **Code**, the new lines carry \`//new:\`.

**The popup.** By default, a pin opens a card with its record's name, \`Map.Popup.Renderer\`. \`marker.popup.onRender\` replaces the popup's whole content, as \`Postcard\` does; to restyle the default card instead, use \`marker.popup.card\` and \`marker.popup.header\`, which go unused beside \`onRender\`.

**The popup parts.** A popup of your own is composed from \`Map.Popup\`'s parts. Each reads the record of the pin it is in, and throws outside a pin.

| Part | Draws |
|---|---|
| \`Map.Popup.Renderer\` | The default popup: the card with the header in it. |
| \`Map.Popup.Card\` | The box the content sits in. |
| \`Map.Popup.Header\` | The record's name; \`statusColumnName\` adds an option set column beside it, as a tag in its option's colour. |
| \`Map.Popup.FieldRows\` | Holds the field rows. |
| \`Map.Popup.FieldRow\` | One column under its display name, given \`columnName\` and an optional \`iconName\`; nothing while the value is empty. |

**The record card parts.** The \`RecordCard\` parts from the package root take any value. The postcard shows the year it joined through \`RecordCardFieldRow\`, since \`Map.Popup.FieldRow\` would format it as a number, *1,958*.

| Part | Props |
|---|---|
| \`RecordCardFieldRow\` | \`label\`, an optional \`iconName\`, and the value as its children. |
| \`RecordCardProgress\` | \`percent\`, from 0 to 100, \`text\`, and an optional \`color\`. |
| \`RecordCardDateRange\` | \`range\`, such as two dates, and an optional \`duration\`. |

**The other pins.** \`useMapRecords()\` returns the records that have a pin, so \`Postcard\` finds the largest capital among them; [**The EU through the years**](?path=/docs/controls-map-guide-your-data-the-eu-through-the-years--overview) has more on it.

The bubble around the content is Leaflet's popup, drawn as a Fluent callout. Its slot, \`marker.popup.container\`, is under *Slots* on [**Reference**](?path=/docs/controls-map-reference--overview).

## Try it

- Open Rome's pin: *Southern Europe*, *Italy*, *1958*, and *73% of Berlin*.
- Open Prague's: *36% of Berlin*.
- Add \`<Map.Popup.FieldRow columnName='population' iconName='People' />\` to the rows: a *Population* row appears.
- Delete \`statusColumnName='region'\`: the tag goes.

## Remember

- \`marker.popup.onRender\` draws the whole popup.
- \`Map.Popup\`'s parts read the pin's record.
- The \`RecordCard\` parts take any value.

{{block: navigation}}
`

const meta = {
    title: 'Controls/Map/Guide/Make it yours/A postcard for each capital',
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

export const APostcardForEachCapital: Story = {
    name: 'A postcard for each capital',
    tags: ['!dev'],
    render: () => renderStory(<APostcardForEachCapitalExample />),
}
