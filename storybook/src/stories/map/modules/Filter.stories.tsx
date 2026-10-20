import type { Meta, StoryObj } from '@storybook/react'
import { useMemo } from 'react'
import { createFilterModule } from '@talxis/base-controls/components/Map/modules/filter'
import { MapDemo } from '../../../map/MapDemo'
import { PIN_RULES } from '../../../map/mapSampleConfig'
import { createSampleDataset, getSiteRecords, SAMPLE_ATTRIBUTES } from '../../../map/mapSampleData'
import { mapStoryParameters } from '../storyHelpers'

const INTRO = `
A panel of the values the records **actually hold**, with a count each, to narrow the pins by. The panel
describes the data rather than the schema: an attribute no record has a value for is not offered.

Values within one attribute widen the result and attributes narrow it - "depots or stores, in Brno".

\`\`\`tsx
modules={{ filter: createFilterModule({ attributes: ['category', 'city'] }) }}
\`\`\`

\`scope: 'map'\`, the default, filters what this map draws and works on any provider. \`scope: 'dataset'\`
pushes an \`In\` filter to the bound dataset instead, so every control sharing it follows - at the cost of
needing a data provider that implements \`In\` for those attributes.
`

const meta = {
    title: 'Map/Modules/Filter',
    tags: ['autodocs'],
    parameters: mapStoryParameters(INTRO)
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const MODULES = { filter: createFilterModule({ attributes: [SAMPLE_ATTRIBUTES.category, 'city'] }) }

const Filtering = () => {
    const dataset = useMemo(() => createSampleDataset({ records: getSiteRecords() }), [])
    return (
        <MapDemo
            dataset={dataset}
            modules={MODULES}
            parameters={{
                LatitudeAttributeName: { raw: SAMPLE_ATTRIBUTES.latitude },
                LongitudeAttributeName: { raw: SAMPLE_ATTRIBUTES.longitude },
                PinRules: { raw: PIN_RULES },
                DefaultProvider: { raw: 'osm' }
            }}
        />
    )
}

export const FilterPanel: Story = {
    name: 'Filtering by record attributes',
    render: () => <Filtering />,
    parameters: {
        docs: {
            description: {
                story: [
                    'Open the filter button top left. The panel offers the two attributes the module was given,',
                    'each as the values the fifteen records hold - store 9, service 4, depot 2 - and picking depot',
                    'leaves exactly the two red pins.'
                ].join(' ')
            }
        }
    }
}
