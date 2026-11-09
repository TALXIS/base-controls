import type { Meta, StoryObj } from '@storybook/react'
import { useMemo } from 'react'
import { MapDemo } from '../../../map/MapDemo'
import { preferredProvider } from '../../../map/mapApiKeys'
import { createSampleDataset, getSiteRecords, SAMPLE_ATTRIBUTES } from '../../../map/mapSampleData'
import { mapStoryParameters } from '../storyHelpers'

const INTRO = `
The control owns everything that is not specific to a map service and delegates the drawing to a
**provider**. Four ship with it, and the control builds all four itself from api keys in the manifest:

| Provider | Key | Renders | Geo-codes | Directions | Points of interest |
| --- | --- | :-: | :-: | :-: | :-: |
| **OpenStreetMap** | none | ✅ | ✅ Nominatim | ✅ OSRM | ✖︎ raster tiles cannot |
| **HERE** | \`HereApiKey\` | ✅ | ✅ | ✅ | ~ lower-detail style |
| **Mapy.com** | \`MapyApiKey\` | ✅ | ✅ | ✅ | ✖︎ |
| **Google Maps** | \`GoogleApiKey\` | ✅ | ✅ | ✅ Routes API | ✅ real map style |

Rendering, geo-coding and directions are **separate capabilities**; a provider does not have to offer all
three. One missing a service borrows it from another configured provider rather than the feature switching
off, so a Mapy-rendered map can still geo-code through HERE when that key is set.

**Three of the four need no registration.** OpenStreetMap, HERE and Mapy.com are built in - they are
Leaflet with a different tile url and cost a consumer nothing. Google Maps is the exception because its
dependency is: importing it is what pulls the optional \`@vis.gl/react-google-maps\` peer into the build, so
the host hands it over instead:

\`\`\`tsx
import { googleMapsProvider } from '@talxis/base-controls/components/Map/providers/google-maps';

<Map ... providers={[googleMapsProvider]} />
\`\`\`

A provider of your own is the same call: an \`IMapProviderDefinition\` whose \`createProvider\` returns a
component taking \`IMapProviderProps\`. The
[README](https://github.com/TALXIS/base-controls/blob/master/src/components/Map/README.md) has the contract.
`

interface IProvidersProps {
    showPointsOfInterest: boolean
    enableProviderSwitching: boolean
}

const Providers = (props: IProvidersProps) => {
    //the two Praha sites alone, so the map opens close enough in that points of interest are drawn at all
    const dataset = useMemo(() => createSampleDataset({
        records: getSiteRecords().filter((record) => record.city === 'Praha')
    }), [])
    return (
        <MapDemo
            dataset={dataset}
            height={540}
            parameters={{
                LatitudeAttributeName: { raw: SAMPLE_ATTRIBUTES.latitude },
                LongitudeAttributeName: { raw: SAMPLE_ATTRIBUTES.longitude },
                ShowPointsOfInterest: { raw: props.showPointsOfInterest },
                EnableProviderSwitching: { raw: props.enableProviderSwitching },
                DefaultProvider: { raw: preferredProvider('google', 'here') }
            }}
        />
    )
}

const meta = {
    title: 'Map/Core/Providers',
    component: Providers,
    tags: ['autodocs'],
    argTypes: {
        showPointsOfInterest: {
            control: 'boolean',
            table: { category: 'Core parameters' },
            description: 'Whether the map draws the shops, stations and landmarks its provider knows about.'
        },
        enableProviderSwitching: {
            control: 'boolean',
            table: { category: 'Core parameters' },
            description: 'Whether the picker offers every configured provider, or the map draws the default alone.'
        }
    },
    args: {
        showPointsOfInterest: false,
        enableProviderSwitching: true
    },
    parameters: mapStoryParameters(INTRO)
} satisfies Meta<typeof Providers>

export default meta
type Story = StoryObj<typeof meta>

export const SwitchProviders: Story = {
    name: 'Switching, and points of interest',
    parameters: {
        docs: {
            description: {
                story: [
                    'The picker in the corner offers every provider whose api key is configured. Switching redraws',
                    'the same pins through a different map, and the new one opens on the view the last one was',
                    'showing rather than snapping back to the pins. Turn **enableProviderSwitching** off and the',
                    'picker goes away - the map draws the default provider and nothing else.',
                    '',
                    'Turn **showPointsOfInterest** on to bring back the shops, stations and landmarks. It is off by',
                    'default so the only pins on the map are the records. Google is the one provider whose tiles can',
                    'express this properly, through a map style, which is why this page opens on it; HERE',
                    'approximates it with a lower-detail style, and the raster tile services that cannot express it',
                    'at all ignore the parameter rather than pretending.'
                ].join(' ')
            }
        }
    }
}
