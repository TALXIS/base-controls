import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../concepts/guide/startGuide'
import { ChangeWhatAPartDrawsExample } from '../../../../concepts/guide/make-it-yours/changeWhatAPartDrawsExamples'

const STEP = 'Change what a part draws'

const DESCRIPTION = `
{{block: progress}}

This step starts from the app of [**The opening plan**](?path=/docs/concepts-guide-more-controls-the-opening-plan--overview) and changes one thing: on the map, each pin takes the colour of its store's status, and its popup shows the manager and the opening date, with a link that opens the store.

{{canvas: Change what a part draws}}

## How it works

*StoreMap.tsx* and *GridExample.tsx* change, and in **Code** their new lines carry \`//new:\`. A part draws what you see through small functions you can replace, handed to it in its \`components\`:

- A **slot** is a function, named \`onRender…\`, that draws one thing of a part.
- A **piece** is a key of \`components\` that names something inside the part and holds its slots.

| In *StoreMap.tsx* | Piece and slot | Draws |
|---|---|---|
| \`StorePin\` | \`marker.pin\`, \`onRenderPin\` | The pin's teardrop, as \`Map.Ui.MarkerPin\` draws it, in the colour of the store's status from \`useMapRecord()\` |
| \`StorePopup\` | \`marker.popup\`, \`onRender\` | The popup, from \`Map.Popup\`'s parts, with a link that calls \`onOpenStore\` |

A slot replaces only what it draws: the pins still follow the search and open their popup. *GridExample.tsx* hands \`StoreMap\` the same \`onOpenStore\` as the grid, so **Open the store** opens the store in the same panel. How slots work is on [**Pieces and slots**](?path=/docs/concepts-pieces-and-slots--overview), and every piece of the map on [**Your own UI**](?path=/docs/controls-map-your-own-ui--overview) in Map. The app now matches the one on [**Introduction**](?path=/docs/concepts-introduction--overview).

## Try it

- Open *On the map*: the planned stores are purple, those fitting out orange and the open ones green.
- Click the pin in Porto: the popup shows the store's status, its manager *Inês Costa* and its opening date. Click **Open the store**: the store's form opens.
- In *All stores*, tick *Bologna Santo Stefano* and **Mark 1 as open**, then open *On the map*: Bologna's pin is green.

## Remember

- A slot replaces one thing a part draws, and the part keeps its behaviour.
- A component in a slot reads the record it draws with \`useMapRecord()\`.

{{block: navigation}}
`

const meta = {
    title: 'Concepts/Guide/Make it yours/Change what a part draws',
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

export const ChangeWhatAPartDraws: Story = {
    name: 'Change what a part draws',
    tags: ['!dev'],
    render: () => renderStory(<ChangeWhatAPartDrawsExample />),
}
