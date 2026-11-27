import type { Meta, StoryObj } from '@storybook/react'
import { useMemo } from 'react'
import { MapDemo } from '../../../map/MapDemo'
import { createSampleDataset, getSiteRecords, SAMPLE_ATTRIBUTES } from '../../../map/mapSampleData'
import { mapStoryParameters } from '../storyHelpers'

const COORDINATES = {
    LatitudeAttributeName: { raw: SAMPLE_ATTRIBUTES.latitude },
    LongitudeAttributeName: { raw: SAMPLE_ATTRIBUTES.longitude }
}

const INTRO = `
Where the pins come from: which records are drawn, and how a coordinate on a related record is reached.

## Attributes across a lookup

Every parameter that names an attribute accepts dot notation, so a record whose coordinates live on a
related address row binds directly:

\`\`\`
LatitudeAttributeName  = cds_addressid.cds_latitude
LongitudeAttributeName = cds_addressid.cds_longitude
\`\`\`

The alias in the path is the alias of the link and the lookup attribute it joins on. The control reads the
value whichever way the host supplied it - the flat aliased key Dataverse returns, or a nested object from
an expand - and where the dataset carries neither, it adds the link and the column itself, hidden so a
sibling control bound to the same dataset does not start showing them. \`AutoAddLinkedColumns\` turns that
off for a host that manages its own dataset.

## Which records

\`PinLoading\` is \`page\` by default, which draws the page the host loaded. \`all\` drains every page of the
view first, on a copy of the data provider, so the dataset the rest of the app is bound to keeps its page
and its paging chrome keeps working. \`MaxRecords\` caps it at 50 000 and the control says when it stopped
short rather than quietly drawing a subset.
`

const meta = {
    title: 'Map/Core/Data',
    tags: ['autodocs'],
    parameters: mapStoryParameters(INTRO)
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const Paging = ({ loadAll }: { loadAll: boolean }) => {
    const dataset = useMemo(() => createSampleDataset({ records: getSiteRecords(), pageSize: 4 }), [])
    return (
        <MapDemo
            dataset={dataset}
            parameters={{ ...COORDINATES, PinLoading: { raw: loadAll ? 'all' : 'page' }, DefaultProvider: { raw: 'osm' } }}
        />
    )
}

export const TheLoadedPage: Story = {
    name: 'The page the host loaded',
    render: () => <Paging loadAll={false} />,
    parameters: {
        docs: {
            description: {
                story: 'Fifteen sites in a dataset paged four at a time. `PinLoading` at `page`, the default, draws what the host loaded - four pins.'
            }
        }
    }
}

export const EveryPage: Story = {
    name: 'Every page of the view',
    render: () => <Paging loadAll />,
    parameters: {
        docs: {
            description: {
                story: 'The same dataset, still paged four at a time, with `PinLoading` at `all`. All fifteen are drawn, and the status message counts the load off while it runs.'
            }
        }
    }
}

const Capped = () => {
    const dataset = useMemo(() => createSampleDataset({ records: getSiteRecords(), pageSize: 4 }), [])
    return (
        <MapDemo
            dataset={dataset}
            parameters={{ ...COORDINATES, PinLoading: { raw: 'all' }, MaxRecords: { raw: 10 }, DefaultProvider: { raw: 'osm' } }}
        />
    )
}

export const StoppedAtTheCap: Story = {
    name: 'A load that stops at the cap',
    render: () => <Capped />,
    parameters: {
        docs: {
            description: {
                story: '`MaxRecords` set to ten. The control draws the first ten and says so, because a map quietly drawing fewer pins than the view holds reads as records that do not exist.'
            }
        }
    }
}
