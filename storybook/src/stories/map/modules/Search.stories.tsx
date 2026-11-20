import type { Meta, StoryObj } from '@storybook/react'
import { useMemo } from 'react'
import { createSearchModule } from '@talxis/base-controls/components/Map/modules/search'
import { MapDemo } from '../../../map/MapDemo'
import { preferredProvider } from '../../../map/mapApiKeys'
import { createSampleDataset, getSiteRecords, SAMPLE_ATTRIBUTES } from '../../../map/mapSampleData'
import { mapStoryParameters } from '../storyHelpers'

const INTRO = `
One box, two searches. Typing and pressing Enter runs the **entity quick find** over the bound dataset -
the same call the dataset control header makes - so the records, and therefore the pins, are filtered.
Typing also offers **places** from the geo-coding service under the box; picking one moves the map there
without touching the dataset, which is how you reach somewhere the records do not cover.

\`\`\`tsx
modules={{ search: createSearchModule() }}
modules={{ search: createSearchModule({ places: false }) }}
\`\`\`

A map hosted inside \`DatasetControl\` already has quick find in that control's header, which is why the box
is a module rather than part of the core: leave it out and there is one search box, not two.
`

const meta = {
    title: 'Map/Modules/Search',
    tags: ['autodocs'],
    parameters: mapStoryParameters(INTRO)
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const MODULES = { search: createSearchModule() }

const Search = () => {
    const dataset = useMemo(() => createSampleDataset({ records: getSiteRecords() }), [])
    return (
        <MapDemo
            dataset={dataset}
            modules={MODULES}
            parameters={{
                LatitudeAttributeName: { raw: SAMPLE_ATTRIBUTES.latitude },
                LongitudeAttributeName: { raw: SAMPLE_ATTRIBUTES.longitude },
                DefaultProvider: { raw: preferredProvider('mapy') }
            }}
        />
    )
}

export const SearchBox: Story = {
    name: 'Searching records, or an address',
    render: () => <Search />,
    parameters: {
        docs: {
            description: {
                story: [
                    'Try `Brno`, or `Praha` for two - Enter filters the fifteen pins through quick find. Typing also',
                    'offers places under the box; try `Wenceslas Square` and pick one to move the map there.',
                    '',
                    'When the geo-coding service takes type-ahead the places follow the typing; when it does not -',
                    'the public Nominatim instance forbids an auto-complete built on it - they follow a submit, the',
                    'same Enter or search button the quick find already runs on.'
                ].join(' ')
            }
        }
    }
}
