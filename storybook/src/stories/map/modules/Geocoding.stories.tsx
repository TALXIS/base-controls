import type { Meta, StoryObj } from '@storybook/react'
import { useMemo, useState } from 'react'
import { createGeocodingModule } from '@talxis/base-controls/components/Map/modules/geocoding'
import { MapDemo } from '../../../map/MapDemo'
import { preferredProvider } from '../../../map/mapApiKeys'
import { createSampleDataset, getSiteRecords, SAMPLE_ATTRIBUTES } from '../../../map/mapSampleData'
import { RecordTable } from '../../../map/RecordTable'
import { mapStoryParameters } from '../storyHelpers'

const COORDINATES = {
    LatitudeAttributeName: { raw: SAMPLE_ATTRIBUTES.latitude },
    LongitudeAttributeName: { raw: SAMPLE_ATTRIBUTES.longitude }
}

const INTRO = `
A record that carries an address but no coordinates is placed by **geo-coding the address**, through
whichever configured provider has a geo-coding service. Lookups are cached and de-duplicated, and an address
the service cannot place is remembered as unplaceable rather than asked about again.

\`\`\`tsx
modules={{ geocoding: createGeocodingModule({ addressAttribute: 'address' }) }}
\`\`\`

**Addresses are resolved one at a time, and each coordinate is saved to its record** - through the same
latitude and longitude attributes the map reads. That write is the point: a record that carries coordinates
is placed by reading them, so an address is sent to a geo-coding service once, by whoever opens the map
first, instead of once per person per visit. It is what makes the keyless OpenStreetMap provider usable at
all, because Nominatim's usage policy asks that a caller not resolve the same thing twice.

\`saveCoordinates: false\` turns the write off, for calculated coordinate attributes or a reader with no
privilege on them. Coordinates are then remembered for the lifetime of the control alone, and the service's
own bulk limit caps how many one view may resolve - 25 on the keyless provider. \`maxRequests\` overrides
every cap.

> A first visit to a large view still resolves up to 250 addresses, one a second. That is a backfill, not a
> steady state - the honest place for it is a plug-in or a flow that geo-codes on save, server side.
`

const meta = {
    title: 'Map/Modules/Geocoding',
    tags: ['autodocs'],
    parameters: mapStoryParameters(INTRO)
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const MODULES = { geocoding: createGeocodingModule({ addressAttribute: SAMPLE_ATTRIBUTES.address }) }

const AddressFallback = () => {
    const dataset = useMemo(() => createSampleDataset({
        //every other site keeps its coordinates, the rest carry only a postal address
        records: getSiteRecords().map((record, index) => index % 2 === 0 ? record : { ...record, lat: null, lng: null })
    }), [])
    return (
        <MapDemo
            dataset={dataset}
            modules={MODULES}
            parameters={{ ...COORDINATES, DefaultProvider: { raw: preferredProvider('here') } }}
        />
    )
}

export const AddressesWithoutCoordinates: Story = {
    name: 'Addresses without coordinates',
    render: () => <AddressFallback />,
    parameters: {
        docs: {
            description: {
                story: [
                    'Half of these sites have had their coordinates removed and carry only a postal address, yet',
                    'all fifteen are drawn. The status message counts the run off while it goes, and says how many',
                    'records it left without a pin if the cap stops it short.'
                ].join(' ')
            }
        }
    }
}

const CoordinatesSavedBack = () => {
    //bumped every time the reader picks another provider, which builds a fresh dataset below - so the
    //provider just picked has to resolve all fifteen addresses itself. A demo device, not something the
    //control does: a real record that already carries coordinates is never geo-coded again.
    const [generation, setGeneration] = useState(0)
    const dataset = useMemo(() => createSampleDataset({
        records: getSiteRecords().map((record) => ({ ...record, lat: null, lng: null }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [generation])

    return (
        <MapDemo
            dataset={dataset}
            modules={MODULES}
            height={460}
            onProviderChange={() => setGeneration((current) => current + 1)}
            //the keyless provider, whose usage policy this is all about
            parameters={{ ...COORDINATES, DefaultProvider: { raw: 'osm' } }}>
            <RecordTable dataset={dataset} columns={['name', 'address', 'lat', 'lng']} limit={15} />
        </MapDemo>
    )
}

export const CoordinatesWrittenBack: Story = {
    name: 'Coordinates saved back to the record',
    render: () => <CoordinatesSavedBack />,
    parameters: {
        docs: {
            description: {
                story: [
                    'All fifteen sites start with a postal address and no coordinates. Watch the `lat` and `lng`',
                    'columns fill in one row at a time, about one a second, and a pin appear for each as it does -',
                    'that is the module resolving an address and saving the answer to the record.',
                    '',
                    "The pace is Nominatim's usage policy: one call a second, one address at a time. Google, HERE",
                    'and Mapy.com price their lookups instead of pacing them, so they declare four at a time and',
                    'finish the same fifteen in about a second - switch providers in the picker to see it, which',
                    'hands the control a fresh set of records.',
                    '',
                    '> Switching back and forth asks the public Nominatim service for the same fifteen addresses',
                    'again each time, which is the one thing its usage policy asks a caller not to do. Use the keyed',
                    'providers for repeated runs.'
                ].join(' ')
            }
        }
    }
}
