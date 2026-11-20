import type { Meta, StoryObj } from '@storybook/react'
import { useMemo } from 'react'
import { IMapModules } from '@talxis/base-controls/components/Map'
import { createCardsModule } from '@talxis/base-controls/components/Map/modules/cards'
import { ADAPTIVE_MAP_CARD_RENDERERS } from '@talxis/base-controls/components/Map/modules/cards/map-card/adaptive-card'
import { createClusteringModule } from '@talxis/base-controls/components/Map/modules/clustering'
import { createEditingModule } from '@talxis/base-controls/components/Map/modules/editing'
import { createFilterModule } from '@talxis/base-controls/components/Map/modules/filter'
import { createGeocodingModule } from '@talxis/base-controls/components/Map/modules/geocoding'
import { createLegendModule } from '@talxis/base-controls/components/Map/modules/legend'
import { createRoutesModule } from '@talxis/base-controls/components/Map/modules/routes'
import { createSearchModule } from '@talxis/base-controls/components/Map/modules/search'
import { MapDemo } from '../../map/MapDemo'
import { ADAPTIVE_CARD_TEMPLATE, LEGEND_HTML, PIN_RULES } from '../../map/mapSampleConfig'
import { createSampleDataset, getSiteRecordsWithFormattedValues, SAMPLE_ATTRIBUTES } from '../../map/mapSampleData'
import { mapStoryParameters } from './storyHelpers'

const MODULES = 'Modules'

interface IEverythingOnProps {
    clustering: boolean
    routes: boolean
    snapRoutesToRoads: boolean
    cards: 'fields' | 'adaptiveCard' | 'off'
    editing: boolean
    geocoding: boolean
    filter: boolean
    search: boolean
    legend: boolean
}

const EverythingOn = (props: IEverythingOnProps) => {
    const dataset = useMemo(() => createSampleDataset({
        //two sites carry only an address, so the geocoding module has something to place
        records: getSiteRecordsWithFormattedValues().map((record, index) => index % 7 === 6 ? { ...record, lat: null, lng: null } : record)
    }), [])
    const modules = useMemo<IMapModules>(() => ({
        ...(props.clustering ? { clustering: createClusteringModule() } : {}),
        ...(props.routes ? {
            routes: createRoutesModule({
                attributes: { route: SAMPLE_ATTRIBUTES.route, sequence: SAMPLE_ATTRIBUTES.stop, color: SAMPLE_ATTRIBUTES.routeColor },
                snapToRoads: props.snapRoutesToRoads
            })
        } : {}),
        ...(props.cards !== 'off' ? {
            cards: createCardsModule({
                defaultCard: props.cards === 'adaptiveCard'
                    ? { type: 'adaptiveCard', template: ADAPTIVE_CARD_TEMPLATE }
                    : { type: 'fields', columns: ['name', 'category', 'city', 'address', 'capacity'] },
                renderers: ADAPTIVE_MAP_CARD_RENDERERS
            })
        } : {}),
        ...(props.editing ? { editing: createEditingModule({ allowDrag: true, allowCreate: true }) } : {}),
        ...(props.geocoding ? { geocoding: createGeocodingModule({ addressAttribute: SAMPLE_ATTRIBUTES.address }) } : {}),
        ...(props.filter ? { filter: createFilterModule({ attributes: [SAMPLE_ATTRIBUTES.category, 'city'] }) } : {}),
        ...(props.search ? { search: createSearchModule() } : {}),
        ...(props.legend ? { legend: createLegendModule({ html: LEGEND_HTML }) } : {})
    }), [props])
    return (
        <MapDemo
            dataset={dataset}
            modules={modules}
            height={560}
            parameters={{
                LatitudeAttributeName: { raw: SAMPLE_ATTRIBUTES.latitude },
                LongitudeAttributeName: { raw: SAMPLE_ATTRIBUTES.longitude },
                PinRules: { raw: PIN_RULES },
                DefaultProvider: { raw: 'osm' }
            }}
        />
    )
}

const INTRO = `
Every module on one map, each behind a switch. This is what a wrapper that exposes the whole feature set
looks like - and every switch below is a module being passed or left out, not a parameter of the core.

Changing the set of modules remounts the map, which is why the map blinks when a switch flips: the stages a
module contributes are React hooks, so the set has to stay the same for the lifetime of one mount.

\`\`\`tsx
<Map
    context={context}
    parameters={{ Dataset, LatitudeAttributeName, LongitudeAttributeName, PinRules }}
    modules={{
        clustering: createClusteringModule(),
        routes: createRoutesModule({ attributes: { route, sequence, color } }),
        cards: createCardsModule({ defaultCard: { type: 'fields' } }),
        editing: createEditingModule({ allowDrag: true }),
        geocoding: createGeocodingModule({ addressAttribute }),
        filter: createFilterModule({ attributes: ['category', 'city'] }),
        search: createSearchModule(),
        legend: createLegendModule({ html })
    }}
/>
\`\`\`
`

const meta = {
    title: 'Map/Everything on',
    component: EverythingOn,
    tags: ['autodocs'],
    argTypes: {
        clustering: { control: 'boolean', table: { category: MODULES }, description: 'Overlapping pins drawn as one, with a count.' },
        routes: { control: 'boolean', table: { category: MODULES }, description: 'Lines through the pins of each delivery run.' },
        snapRoutesToRoads: { control: 'boolean', table: { category: MODULES }, description: 'Whether the lines follow the roads. One request per route.' },
        cards: { control: 'inline-radio', options: ['fields', 'adaptiveCard', 'off'], table: { category: MODULES }, description: 'What a pin opens.' },
        editing: { control: 'boolean', table: { category: MODULES }, description: 'Drag a pin to move its record, click the map to create one.' },
        geocoding: { control: 'boolean', table: { category: MODULES }, description: 'Place the two sites that carry only an address.' },
        filter: { control: 'boolean', table: { category: MODULES }, description: 'The filter panel, on category and city.' },
        search: { control: 'boolean', table: { category: MODULES }, description: 'The search box.' },
        legend: { control: 'boolean', table: { category: MODULES }, description: 'The legend.' }
    },
    args: {
        clustering: true,
        routes: true,
        snapRoutesToRoads: false,
        cards: 'fields',
        editing: false,
        geocoding: true,
        filter: true,
        search: true,
        legend: true
    },
    parameters: mapStoryParameters(INTRO)
} satisfies Meta<typeof EverythingOn>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
