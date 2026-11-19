import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../concepts/guide/startGuide'
import { WhereStoresComeFromExample } from '../../../../concepts/guide/your-data/whereStoresComeFromExamples'

const STEP = 'Where stores come from'

const DESCRIPTION = `
{{block: progress}}

This step starts from the app of [**The opening plan**](?path=/docs/concepts-guide-more-controls-the-opening-plan--overview) and changes one thing: the stores are saved through your own API, which refuses a store too small to open.

{{canvas: Where stores come from}}

## How it works

The app is the one from [**The opening plan**](?path=/docs/concepts-guide-more-controls-the-opening-plan--overview), and only *stores.ts* changes. In **Code**, the new lines carry \`//new:\`, and *api.ts* and *dataverse.ts* are new. Every control reads the stores from the provider \`createStoresProvider\` returns, and saves them through it, so the provider alone decides where they come from and go.

| In the code | Is | See |
|---|---|---|
| \`StoresProvider\` in *stores.ts* | A \`MemoryDataProvider\` whose \`onRecordSave\` sends each store to *api.ts* first, and returns a failed save with the API's message when it refuses | *Your own provider* on [**Data providers**](?path=/docs/concepts-data-providers--overview) |
| *api.ts* | Stands in for your server: it takes 600 ms, and refuses a floor area under 50 m² | |
| *dataverse.ts* | \`createStoresProvider\` over a \`FetchXmlDataProvider\`, which reads and saves a Dataverse table | *Pick a provider* on [**Data providers**](?path=/docs/concepts-data-providers--overview) |

In a model-driven app, *GridExample.tsx* imports \`createStoresProvider\` from *dataverse.ts* instead of *stores.ts*, and the views name the table's own columns. When your API sorts, filters and pages itself, extend \`DataProvider\` instead, as *Your own provider* shows.

## Try it

- Double-click Lyon's *Floor area (m²)*, type 30, press Enter and **Save**: a spinner shows in the row's checkbox, then a red mark that stays. Click the mark: *The floor area must be at least 50 m².*
- Set it to 200 and **Save**: the API takes it, and a green check shows in the row's checkbox for a moment.
- In **Code**, set \`MIN_FLOOR_AREA\` to 250 in *api.ts* and save Lyon at 200: the API refuses it, and its message says 250 m².

## Remember

- The provider decides where the records come from and where they are saved.
- To save through your API, extend a provider and override \`onRecordSave\`.
- A failed save marks its row, with your API's message.

{{block: navigation}}
`

const meta = {
    title: 'Concepts/Guide/Your data/Where stores come from',
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

export const WhereStoresComeFrom: Story = {
    name: 'Where stores come from',
    tags: ['!dev'],
    render: () => renderStory(<WhereStoresComeFromExample />),
}
