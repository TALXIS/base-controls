import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { ExploreCards, IExploreCard } from '../../grid/showcase/ExploreCards'
import { GuideMap } from '../../map/guide/mapGuide'
import { TripPlannerShowcase } from '../../map/guide/overviewExamples'

const DESCRIPTION = `
A map shows records as pins, each at the latitude and longitude two of its columns hold, such as the capitals on the EU trip below. It reads the records from a data provider and works out where to look, while a map library, Leaflet or Google Maps, draws the map, the pins and the popups they open. Try it below: open two capitals, press **Select** in each, then press **Mark 2 as visited**: their postcards now read *Visited*.

{{canvas: The trip planner}}

## What you see

| You see | Drawn by | Taught in |
|---|---|---|
| The capitals as pins, with the map's view fitting them all | \`LeafletMap\` in \`DatasetControl.Body\`, drawing the control's provider | [**Your first map**](?path=/docs/controls-map-guide-basics-your-first-map--overview) |
| The map filling the control under its header | The map's box | [**Make it fit**](?path=/docs/controls-map-guide-basics-make-it-fit--overview) |
| OpenStreetMap's tiles | Leaflet | [**Pick the tiles**](?path=/docs/controls-map-guide-basics-pick-the-tiles--overview) |
| Pins in their region's colour, and a star on capitals of two million or more | \`RegionPin\` and \`CapitalDot\` in \`components.marker.pin\` | [**Pins coloured by region**](?path=/docs/controls-map-guide-make-it-yours-pins-coloured-by-region--overview) |
| The postcard: the trip status, the country, the year it joined, and the population against the largest capital's | \`TripPostcard\`, from \`Map.Popup\`'s parts and \`Field.Progress\` | [**A postcard for each capital**](?path=/docs/controls-map-guide-make-it-yours-a-postcard-for-each-capital--overview) |
| **Select**, a dark pin while selected, and **Mark 2 as visited** | \`useCapital()\` and \`TripRibbon\` | [**A trip planner**](?path=/docs/controls-map-guide-your-data-a-trip-planner--overview) |
| *All capitals*, *Wishlist* and *Visited*; the search field; the map-shaped placeholder; *Loading map data…* | \`DatasetControl.ViewSwitcher\`, \`DatasetControl.QuickFind\`, \`Map.Ui.Skeleton\` and \`LoadingCover\` | [**A trip planner**](?path=/docs/controls-map-guide-your-data-a-trip-planner--overview) |
| **Next capital** and **Show all** under the map | \`Tour\`, a child of the map | [**A tour from west to east**](?path=/docs/controls-map-guide-advanced-a-tour-from-west-to-east--overview) |

## How it fits together

The map reads the records of the provider around it and works out their pins and the map's view, and its library module draws them, so on every load of the provider the pins and the map's view follow.

| Piece | Does | Taught in |
|---|---|---|
| The provider | Holds the capitals: a \`DataProviderScope\`'s, or the one a \`DatasetControl\` loads. Filtering or searching it changes the pins. | [**Your first map**](?path=/docs/controls-map-guide-basics-your-first-map--overview), [**The EU through the years**](?path=/docs/controls-map-guide-your-data-the-eu-through-the-years--overview) |
| \`LeafletMap\` or \`GoogleMap\` | \`Map\` with its library built in: a pin for each record whose position columns hold numbers. | [**Your first map**](?path=/docs/controls-map-guide-basics-your-first-map--overview), [**Pick the tiles**](?path=/docs/controls-map-guide-basics-pick-the-tiles--overview) |
| The library module | Draws the map, the pins and their popups, and moves the map's view when asked. | [**Pick the tiles**](?path=/docs/controls-map-guide-basics-pick-the-tiles--overview), [**A library of your own**](?path=/docs/controls-map-guide-advanced-a-library-of-your-own--overview) |
| Slots | Draw the pins and the popups your way, each reading its pin's record. | [**Pins coloured by region**](?path=/docs/controls-map-guide-make-it-yours-pins-coloured-by-region--overview) |
| The viewport | Works out the map's view, and asks the library to move there on every load. | [**Your first map**](?path=/docs/controls-map-guide-basics-your-first-map--overview), [**A tour from west to east**](?path=/docs/controls-map-guide-advanced-a-tour-from-west-to-east--overview) |
| Your components | Drawn in the map's box under the library's map, where the hooks reach the map. | [**The EU through the years**](?path=/docs/controls-map-guide-your-data-the-eu-through-the-years--overview) |

## The guide

The guide builds the trip above one step at a time, from the capitals on a map to a map library of your own.

{{block: guide}}

Showing the records of a DatasetControl? Do *Basics*, then [**A trip planner**](?path=/docs/controls-map-guide-your-data-a-trip-planner--overview).

## Words you will meet

| Word | Means | Explained in |
|---|---|---|
| Pin | The marker the map draws at a record's position; a click opens its popup. | [**Your first map**](?path=/docs/controls-map-guide-basics-your-first-map--overview) |
| Provider | What holds the records the map draws, such as a \`MemoryDataProvider\`. | [**Your first map**](?path=/docs/controls-map-guide-basics-your-first-map--overview) |
| Field mapping | The map's \`fieldMapping\`: the columns that hold each record's latitude and longitude. | [**Your first map**](?path=/docs/controls-map-guide-basics-your-first-map--overview) |
| The map's view | Where the map looks. The map picks it from the pins on every load, and the user pans and zooms in between. | [**Your first map**](?path=/docs/controls-map-guide-basics-your-first-map--overview) |
| Map library | What draws the map, the pins and the popups: Leaflet in \`LeafletMap\`, Google Maps in \`GoogleMap\`. | [**Pick the tiles**](?path=/docs/controls-map-guide-basics-pick-the-tiles--overview) |
| Tiles | The images of the world a Leaflet map is drawn over, from a tile service such as OpenStreetMap. | [**Pick the tiles**](?path=/docs/controls-map-guide-basics-pick-the-tiles--overview) |
| Slot | One replaceable piece of the map's \`components\`, such as the teardrop of each pin. | [**Pins coloured by region**](?path=/docs/controls-map-guide-make-it-yours-pins-coloured-by-region--overview) |
| Popup | What a pin opens: the record's name by default, or content of your own. | [**A postcard for each capital**](?path=/docs/controls-map-guide-make-it-yours-a-postcard-for-each-capital--overview) |
| View | A DatasetControl's named view, such as *Wishlist*; not the map's view. | [**A trip planner**](?path=/docs/controls-map-guide-your-data-a-trip-planner--overview) |
| The map | The \`IMap\` of one mount, through which your code reaches the modules, the provider and the viewport. | [**A tour from west to east**](?path=/docs/controls-map-guide-advanced-a-tour-from-west-to-east--overview) |
| Viewport | What works out the map's view and asks the library to move there. | [**A tour from west to east**](?path=/docs/controls-map-guide-advanced-a-tour-from-west-to-east--overview) |
| Library module | The module named \`library\` that draws the map; \`LeafletMap\` and \`GoogleMap\` have one built in. | [**A library of your own**](?path=/docs/controls-map-guide-advanced-a-library-of-your-own--overview) |

## Where next

{{block: explore}}
`

const EXPLORE: IExploreCard[] = [
    { title: 'Your first map', iconName: 'Education', href: '?path=/docs/controls-map-guide-basics-your-first-map--overview', text: 'Start the guide: the capitals of the EU as pins on a map.' },
    { title: 'Reference', iconName: 'Table', href: '?path=/docs/controls-map-reference--overview', text: 'Every prop, member, hook and slot of the map.' },
    { title: 'DatasetControl', iconName: 'ViewList', href: '?path=/docs/controls-datasetcontrol-overview--overview', text: 'The frame around a list of records, with views, a search and a ribbon around the map.' },
]

const meta = {
    title: 'Controls/Map/Overview',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION, { guide: () => <GuideMap />, explore: () => <ExploreCards cards={EXPLORE} /> }),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const TheTripPlanner: Story = {
    name: 'The trip planner',
    render: () => renderStory(<TripPlannerShowcase />),
}
