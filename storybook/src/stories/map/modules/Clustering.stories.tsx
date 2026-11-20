import type { Meta, StoryObj } from '@storybook/react'
import { useMemo } from 'react'
import { createClusteringModule } from '@talxis/base-controls/components/Map/modules/clustering'
import { createRoutesModule } from '@talxis/base-controls/components/Map/modules/routes'
import { MapDemo } from '../../../map/MapDemo'
import { PIN_RULES } from '../../../map/mapSampleConfig'
import { createSampleDataset, generateSiteRecords, getSiteRecords, SAMPLE_ATTRIBUTES } from '../../../map/mapSampleData'
import { mapStoryParameters } from '../storyHelpers'

const COORDINATES = {
    LatitudeAttributeName: { raw: SAMPLE_ATTRIBUTES.latitude },
    LongitudeAttributeName: { raw: SAMPLE_ATTRIBUTES.longitude }
}

const INTRO = `
Pins that overlap in the current view are drawn as **one pin carrying the count**. The grouping is done in
the control, over the viewport, so every provider groups identically and is only ever handed what is inside
the view - which is what makes a dataset of thousands usable.

Clicking a grouped pin zooms to where the group comes apart. With the **cards** module on, it opens a card
listing the records behind it instead. A pin on a drawn route is never grouped, so a line always connects
pins the user can see.

\`\`\`tsx
modules={{ clustering: createClusteringModule() }}
modules={{ clustering: createClusteringModule({ radius: 60, maxZoom: 16, maxLeaves: 20 }) }}
\`\`\`

| Option | Default | What it does |
| --- | --- | --- |
| \`radius\` | 40 | Pixels within which pins merge. Larger groups more aggressively. |
| \`maxZoom\` | 20 | Zoom from which pins never merge. |
| \`maxLeaves\` | 50 | Member records a group lists on its card. The count is always exact. |
`

const meta = {
    title: 'Map/Modules/Clustering',
    tags: ['autodocs'],
    parameters: mapStoryParameters(INTRO)
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const CLUSTERING = { clustering: createClusteringModule() }

const LargeDataset = () => {
    const dataset = useMemo(() => createSampleDataset({ records: generateSiteRecords(5000), pageSize: 250 }), [])
    return (
        <MapDemo
            dataset={dataset}
            modules={CLUSTERING}
            parameters={{ ...COORDINATES, PinLoading: { raw: 'all' }, DefaultProvider: { raw: 'osm' } }}
        />
    )
}

export const LargeDatasets: Story = {
    name: 'Thousands of pins',
    render: () => <LargeDataset />,
    parameters: {
        docs: {
            description: {
                story: [
                    'Five thousand records, every page loaded. Pins that overlap in the current view are drawn as',
                    'one carrying the number behind it, and the grouping is redone against the viewport whenever',
                    'you pan or zoom - so the provider is only ever handed the pins on screen. Click a group to zoom',
                    'to where it comes apart.'
                ].join(' ')
            }
        }
    }
}

const SameSpot = () => {
    const dataset = useMemo(() => createSampleDataset({
        //six warehouses on one site, among the rest of the country - so the map fits wide and they overlap
        records: [
            ...Array.from({ length: 6 }, (_, index) => ({
                name: `Praha warehouse ${index + 1}`,
                category: index % 2 ? 'store' : 'depot',
                city: 'Praha',
                address: `Kolbenova ${900 + index}, 190 00 Praha 9`,
                capacity: 100 + index * 40,
                openedOn: `202${index}-03-01`,
                lat: 50.1038 + index * 0.0004,
                lng: 14.4806 + index * 0.0004
            })),
            ...getSiteRecords().filter((record) => record.city !== 'Praha')
        ]
    }), [])
    return (
        <MapDemo
            dataset={dataset}
            modules={CLUSTERING}
            parameters={{ ...COORDINATES, PinRules: { raw: PIN_RULES }, DefaultProvider: { raw: 'osm' } }}
        />
    )
}

export const GroupedPins: Story = {
    name: 'Pins that land on the same spot',
    render: () => <SameSpot />,
    parameters: {
        docs: {
            description: {
                story: [
                    'Six warehouses on one Praha site, drawn among the rest of the country so the map fits wide',
                    'enough that they overlap. The control draws them as a single pin carrying the count; zoom in',
                    'and they come apart into their own coloured pins.'
                ].join(' ')
            }
        }
    }
}

const RoutedPins = () => {
    const dataset = useMemo(() => createSampleDataset({ records: getSiteRecords() }), [])
    const modules = useMemo(() => ({
        routes: createRoutesModule({ attributes: { route: SAMPLE_ATTRIBUTES.route, sequence: SAMPLE_ATTRIBUTES.stop, color: SAMPLE_ATTRIBUTES.routeColor } }),
        //a radius wide enough that the Praha sites would otherwise merge at the zoom the country fits at
        clustering: createClusteringModule({ radius: 80 })
    }), [])
    return (
        <MapDemo
            dataset={dataset}
            modules={modules}
            parameters={{ ...COORDINATES, DefaultProvider: { raw: 'osm' } }}
        />
    )
}

export const RoutesStayApart: Story = {
    name: 'Pins on a route stay apart',
    render: () => <RoutedPins />,
    parameters: {
        docs: {
            description: {
                story: [
                    'Routes and clustering together, with a grouping radius wide enough that the two Praha sites',
                    'would merge. They do not: a pin on a drawn line is never grouped, because a line ending at a',
                    "group's centroid reads as detached from the stop it connects. The four sites on no route",
                    'cluster as usual.'
                ].join(' ')
            }
        }
    }
}
