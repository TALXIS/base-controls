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

**The popup.** By default, a pin opens \`Map.Popup.Renderer\`: the record's name, and its visible columns that hold a value. \`marker.popup.onRender\` replaces the popup's whole content, as \`Postcard\` does; to restyle the default instead, use \`marker.popup.header\`, \`body\`, \`fieldList\` and \`field\`, which go unused beside \`onRender\`.

**The popup parts.** A popup of your own is composed from \`Map.Popup\`'s parts. \`Header\`, \`FieldList\` and \`Field\` read the record of the pin they are in, and throw outside a pin.

| Part | Draws |
|---|---|
| \`Map.Popup.Renderer\` | The default popup: the header, and the record's visible columns below it. |
| \`Map.Popup.Header\` | The record's name; \`statusColumnName\` adds an option set column beside it, as a tag in its option's colour. |
| \`Map.Popup.Body\` | What sits below the header. |
| \`Map.Popup.Footer\` | A band at the bottom, below a divider. |
| \`Map.Popup.FieldList\` | Holds the fields. |
| \`Map.Popup.Field\` | One column under its display name, given \`columnName\` and an optional \`iconName\`; an option set as tags; nothing while the value is empty. |

**The field parts.** The \`Field\` parts from the package root take any value. The postcard shows the year it joined through \`Field.Value\`, since \`Map.Popup.Field\` would format it as a number, *1,958*.

| Part | Props |
|---|---|
| \`Field.Value\` | \`label\`, an optional \`iconName\`, and the value as its children. |
| \`Field.OptionSet\` | One option as a tag: \`label\` and an optional \`color\`. |
| \`Field.Progress\` | \`percent\`, from 0 to 100, \`text\`, and an optional \`color\`. |
| \`Field.DateRange\` | \`range\`, such as two dates, and an optional \`duration\`. |

**The other pins.** \`useMapRecords()\` returns the records that have a pin, so \`Postcard\` finds the largest capital among them; [**The EU through the years**](?path=/docs/controls-map-guide-your-data-the-eu-through-the-years--overview) has more on it.

The bubble around the content is Leaflet's popup, drawn as a Fluent callout. Its slot, \`marker.popup.container\`, is under *Slots* on [**Reference**](?path=/docs/controls-map-reference--overview).

## Try it

- Open Rome's pin: *Southern Europe*, *Italy*, *1958*, and *73% of Berlin*.
- Open Prague's: *36% of Berlin*.
- Add \`<Map.Popup.Field columnName='population' iconName='People' />\` to the fields: a *Population* field appears.
- Delete \`statusColumnName='region'\`: the tag goes.

## Remember

- \`marker.popup.onRender\` draws the whole popup.
- \`Map.Popup.Header\` and \`Map.Popup.Field\` read the pin's record.
- The \`Field\` parts take any value.

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
