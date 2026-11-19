import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../../../form/storyHelpers'
import { gridDocsPage } from '../../../../grid/gridDocsPage'
import { GuideNavigation, GuideProgress } from '../../../../map/guide/mapGuide'
import { ATripPlannerExample } from '../../../../map/guide/your-data/aTripPlannerExamples'

const STEP = 'A trip planner'

const DESCRIPTION = `
{{block: progress}}

The trip becomes a planner: views of the wishlist and the visited capitals, a search, and a command that marks capitals as visited.

{{canvas: A trip planner}}

## How it works

The map moves into a [**DatasetControl**](?path=/docs/controls-datasetcontrol-overview--overview), so this step starts its own files. \`data.ts\` adds each capital's trip status, \`views.ts\` loads the capitals for the control, and *CapitalCard.tsx* holds the pins and the popup. In *GridExample.tsx*, each new component and slot carries \`//new:\`.

**The map in the body.** \`LeafletMap\` goes in \`DatasetControl.Body\` with no provider of its own, and draws the control's, as [**Your first map**](?path=/docs/controls-map-guide-basics-your-first-map--overview) says; the parts go in the header, as for any body ([**Lay it out**](?path=/docs/controls-datasetcontrol-guide-features-lay-it-out--overview)). With a \`height\` on the control, the map takes what the header and the footer leave.

**Loads.** The control mounts its body again on every load, such as a view switch or saving the columns, and the map with it, so the map's view fits the new pins each time. What starts a load is on [**Load the deals**](?path=/docs/controls-datasetcontrol-guide-basics-load-the-deals--overview). A search is not a load: the pins follow it as they follow the slider of [**The EU through the years**](?path=/docs/controls-map-guide-your-data-the-eu-through-the-years--overview), and a search that finds nothing moves the map's view as *Your first map* says.

**While it loads.** While the control loads, it shows a placeholder shaped like a grid; \`Map.Ui.Skeleton\` is one shaped like a header over a map, handed to \`components.skeleton.onRender\` with the props the slot gets. Once the map is drawn, it shows no loading state of its own while the provider loads, so \`LoadingCover\` covers the control while the provider's \`onLoading\` says it loads, with \`useDatasetControl().loading.show()\`: see *Run actions* on [**RuntimeHost**](?path=/docs/controls-runtimehost-get-started--overview). \`loadTrip\` makes each load take a second, so you can see both.

**Views.** Each view's \`resolve\` filters by the trip status and returns its columns. List the latitude, longitude and status columns in every view with \`isHidden: true\`, as \`READ_BY_THE_MAP\` does, so they load for the pins and the popup without being shown. How views work is on [**Views**](?path=/docs/controls-datasetcontrol-guide-basics-views--overview).

**Search.** \`DatasetControl.QuickFind\` searches the provider's \`QuickFindColumns\`, here the capital and its country in \`data.ts\`. See [**Search and page**](?path=/docs/controls-datasetcontrol-guide-features-search-and-page--overview).

**Selection.** A map has no selection of its own, so **Select** in the popup sets the provider's, with \`setSelectedRecordIds\`. \`useDataProviderEvents\` in \`useCapital\` draws the pin and the popup again when the selection or a value changes. The ribbon loads its commands again on every selection, so \`TripRibbon\` offers **Mark N as visited** only while capitals are selected, and saves them at once. How the ribbon works is on [**Act on deals**](?path=/docs/controls-datasetcontrol-guide-features-act-on-deals--overview).

**Edit columns.** \`CapitalCard\` draws a field for each column the view shows that is neither hidden nor the name, so saving in **Edit columns**, which mounts the control again, changes the popup. What Edit columns offers comes from the provider, here the saved query \`loadTrip\` sets: see [**Choose the columns**](?path=/docs/controls-datasetcontrol-guide-features-choose-the-columns--overview).

## Try it

- Open Lisbon's and Dublin's pins and press **Select** in each: both pins turn dark, and the ribbon offers **Mark 2 as visited**.
- Press it, then switch to *Visited*: ten capitals, Lisbon and Dublin among them, in green.
- Switch back to *All capitals* and search *Bu*: *Loading map data…* covers the control for a second, then three pins are left: Bucharest, Budapest and Sofia, in Bulgaria.
- Open **Edit columns**, add *Population* and save: each popup has a *Population* field.

## Remember

- The map in the body draws the control's provider.
- List the position columns, hidden, in every view.
- Pins and popups reach the control's provider for the selection and the columns.

Your records decide the pins. Advanced hands the map to your code.

{{block: navigation}}
`

const meta = {
    title: 'Controls/Map/Guide/Your data/A trip planner',
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

export const ATripPlanner: Story = {
    name: 'A trip planner',
    tags: ['!dev'],
    render: () => renderStory(<ATripPlannerExample />),
}
