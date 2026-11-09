import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { TripPlannerExample } from './mapExamples'

const DESCRIPTION = `
A map can be the body of a [**DatasetControl**](?path=/docs/controls-datasetcontrol-get-started--overview), so the records on it come with the control's parts around them: views to switch between, quick find, a ribbon of commands and Edit columns. The map shows whatever the control has loaded, and pins and popups of your own read the control's provider, so they follow the view, the search, the columns and the selection. Try it below: open two capitals and press **Select** in each, then pick **Mark 2 as visited** in the ribbon.

{{canvas: A trip planner}}

## Put the map in the body

\`LeafletMap\` or \`GoogleMap\` goes in \`DatasetControl.Body\` with no provider of its own, as in the example's \`GridExample.tsx\`, and the parts go in the header as for any body: see [**Layout**](?path=/docs/controls-datasetcontrol-layout--overview). The control mounts its body again for each load, such as a view switch or saving the columns, and the map with it, so its view fits the new pins each time.

## The placeholder

Until its first load, a \`DatasetControl\` shows a placeholder shaped like a grid. \`Map.Ui.Skeleton\` draws a map in place of the grid's rows and footer, under the same header, so nothing jumps when the map arrives. Hand it to \`components.skeleton.onRenderSkeleton\`, as \`GridExample.tsx\` does; it takes the control's \`height\` and \`showHeader\`.

## Views

Each view in \`views.ts\` sets the provider up in \`resolve\`, such as *Wishlist* filtering on the trip status, and returns its columns. List the latitude and longitude columns in every view with \`isHidden: true\`, as \`READ_BY_THE_MAP\` does, so they are loaded for the pins without being shown or listed in Edit columns. How views work: [**Views**](?path=/docs/controls-datasetcontrol-views--overview).

## Quick find

\`DatasetControl.QuickFind\` searches the provider's quick find columns, here the capital and its country in \`QuickFindColumns\` in \`data.ts\`, and the map shows only what it finds. See [**Quick find**](?path=/docs/controls-datasetcontrol-parts-quick-find--overview).

## Selection and the ribbon

A map has no selection of its own, so the popup's **Select** sets the provider's, with \`setSelectedRecordIds\` in \`CityCard.tsx\`. \`DatasetControl.Ribbon\` loads its commands again on every selection, so \`TripRibbon\` offers **Mark as visited** only while capitals are selected, and \`CityPin\` draws a selected pin dark with \`useDataProviderEvents\`. How the ribbon works: [**Ribbon**](?path=/docs/controls-datasetcontrol-parts-ribbon--overview).

## Edit columns

\`CityCard\` draws a row for each column in \`provider.getColumns()\` that is neither hidden nor the primary name, so the popup shows the columns of the open view as the user left them. Saving in Edit columns remounts the control with the new columns, and the popup follows. The columns Edit columns offers come from the provider, here the saved query \`loadTrip\` sets: see [**Edit columns**](?path=/docs/controls-datasetcontrol-parts-edit-columns--overview).

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Views', iconName: 'ViewList', href: '?path=/docs/controls-datasetcontrol-views--overview', text: 'Named views of the same records, each with its own columns and filter.' },
    { title: 'Ribbon', iconName: 'Ribbon', href: '?path=/docs/controls-datasetcontrol-parts-ribbon--overview', text: 'Commands for the selected records, and the built-in ones.' },
    { title: 'Your own UI', iconName: 'Edit', href: '?path=/docs/controls-map-your-own-ui--overview', text: 'Every slot of the pins and the popups.' },
]

const meta = {
    title: 'Controls/Map/In a DatasetControl',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { explore: () => <ExploreCards cards={EXPLORE} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const ATripPlanner: Story = {
    name: 'A trip planner',
    render: () => renderStory(<TripPlannerExample />),
}
