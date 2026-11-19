import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../concepts/guide/startGuide'
import { OnTheMapExample } from '../../../../concepts/guide/more-controls/onTheMapExamples'

const STEP = 'On the map'

const DESCRIPTION = `
{{block: progress}}

The team plans the openings across Europe and wants to see where each store is. This step adds a view that draws the same stores as pins on a map, with the same search.

{{canvas: On the map}}

## How it works

The app is the one from [**Open a store in a form**](?path=/docs/concepts-guide-basics-open-a-store-in-a-form--overview); in **Code**, the new lines carry \`//new:\`, and *StoreMap.tsx* is new.

**The map.** \`LeafletMap\` takes no provider of its own: in the body of a \`DatasetControl\`, it draws the control's, as the grid does, so the search narrows the pins. \`fieldMapping\` names the columns that hold each store's latitude and longitude, \`lat\` and \`lng\`: see [**Map**](?path=/docs/controls-map-get-started--overview). \`VIEW_COLUMNS\` in *stores.ts* lists them as hidden columns, so every view loads them without showing them: see [**In a DatasetControl**](?path=/docs/controls-map-in-a-datasetcontrol--overview).

**Picked by the view.** *On the map* is a view as in [**Views and commands**](?path=/docs/concepts-guide-basics-views-and-commands--overview), whose \`resolve\` returns \`data: { ui: 'map' }\`. \`Stores\` reads it from the open view with \`useDatasetControl().getView()\`, typed by \`IStoreViewData\`. The control mounts its body anew for every view, so \`Stores\` draws the map or the grid for the view it opened with. **Edit columns** changes the columns the grid shows, so only the grid offers it. How a view's \`data\` picks what the body draws: [**Your own UI**](?path=/docs/controls-datasetcontrol-guide-advanced-your-own-ui--overview).

## Try it

- Switch to *On the map*: six pins across Europe, and **Edit columns** is gone.
- Search for *Lyon*: one pin is left, and the map centres on it.
- Click the pin: a popup shows the store's name.

## Remember

- Any control that draws a provider fits in the body of a \`DatasetControl\`.
- A view's \`data\` tells your code what to draw.

{{block: navigation}}
`

const meta = {
    title: 'Concepts/Guide/More controls/On the map',
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

export const OnTheMap: Story = {
    name: 'On the map',
    tags: ['!dev'],
    render: () => renderStory(<OnTheMapExample />),
}
