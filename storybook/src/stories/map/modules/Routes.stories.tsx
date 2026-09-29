import type { Meta, StoryObj } from '@storybook/react'
import { useMemo } from 'react'
import { createRoutesModule } from '@talxis/base-controls/components/Map/modules/routes'
import { MapDemo } from '../../../map/MapDemo'
import { preferredProvider } from '../../../map/mapApiKeys'
import { createSampleDataset, getSiteRecords, SAMPLE_ATTRIBUTES } from '../../../map/mapSampleData'
import { mapStoryParameters } from '../storyHelpers'

const INTRO = `
Pins that belong together can be drawn **connected**. The routes module reads three attributes, and only
the first is required:

| Option | What it does |
| --- | --- |
| \`attributes.route\` | Groups the pins. Records sharing a non-empty value become one line. |
| \`attributes.sequence\` | Orders the pins along it. Without one they are drawn in dataset order. |
| \`attributes.color\` | Colours it. The first pin on the line that has a value wins. |

A group of fewer than two pins is not a line and is dropped. Sequence sorts as a number where it is one, so
stop 10 follows stop 9 rather than stop 1. A pin on a drawn line is never merged into a cluster, so the line
always connects pins the user can see.

\`\`\`tsx
modules={{
    routes: createRoutesModule({
        attributes: { route: 'route', sequence: 'stop', color: 'routeColor' },
        snapToRoads: true,
        isRouteVisible: (route) => checkedRouteIds.has(route.id)
    })
}}
\`\`\`
`

const meta = {
    title: 'Map/Modules/Routes',
    tags: ['autodocs'],
    parameters: mapStoryParameters(INTRO)
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const COORDINATES = {
    LatitudeAttributeName: { raw: SAMPLE_ATTRIBUTES.latitude },
    LongitudeAttributeName: { raw: SAMPLE_ATTRIBUTES.longitude }
}

/** The sites that belong to a run, ordered by name so the sequence attribute has something to prove. */
const getRouteRecords = () => getSiteRecords()
    .filter((record) => !!record.route)
    .sort((left, right) => `${left.name}`.localeCompare(`${right.name}`))

const Connections = ({ snap, provider, onlyNorth }: { snap: boolean; provider: string; onlyNorth?: boolean }) => {
    const dataset = useMemo(() => createSampleDataset({ records: getRouteRecords() }), [])
    const modules = useMemo(() => ({
        routes: createRoutesModule({
            attributes: { route: SAMPLE_ATTRIBUTES.route, sequence: SAMPLE_ATTRIBUTES.stop, color: SAMPLE_ATTRIBUTES.routeColor },
            snapToRoads: snap,
            isRouteVisible: onlyNorth ? (route) => route.id === 'North run' : undefined
        })
    }), [snap, onlyNorth])
    return (
        <MapDemo
            dataset={dataset}
            modules={modules}
            parameters={{ ...COORDINATES, DefaultProvider: { raw: provider } }}
        />
    )
}

export const StraightConnections: Story = {
    name: 'Connect pins into a line',
    render: () => <Connections snap={false} provider='osm' />,
    parameters: {
        docs: {
            description: {
                story: [
                    'Three delivery runs. The records are handed over sorted by name, so without the sequence',
                    'attribute the lines would zigzag; with it each run goes depot → stop 2 → stop 3 → stop 4.',
                    'North is blue, south red, west green, each colour read off the records themselves.'
                ].join(' ')
            }
        }
    }
}

export const SnappedConnections: Story = {
    name: 'Follow the roads instead',
    render: () => <Connections snap provider={preferredProvider('mapy')} />,
    parameters: {
        docs: {
            description: {
                story: [
                    'The same three runs with `snapToRoads` on, resolved through whichever configured provider has',
                    'a directions service - Mapy.com here, OSRM when no key is set. The lines now follow the road',
                    'network rather than cutting across country.',
                    '',
                    'Optional in every sense: a module that does not ask for it draws straight lines, a provider',
                    'with no directions service leaves them straight, and a single run the service cannot resolve',
                    'stays straight while the others are snapped. It costs one request per route, which is why it',
                    'is off by default.'
                ].join(' ')
            }
        }
    }
}

export const HiddenRoutes: Story = {
    name: 'Draw only some of the routes',
    render: () => <Connections snap={false} provider='osm' onlyNorth />,
    parameters: {
        docs: {
            description: {
                story: [
                    '`isRouteVisible` decides per route whether its line is drawn. Only the north run is here; the',
                    'pins of the other two stay on the map as plain pins, and the routes the host hides never cost a',
                    'directions request either.'
                ].join(' ')
            }
        }
    }
}
