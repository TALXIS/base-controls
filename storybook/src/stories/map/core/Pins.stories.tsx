import type { Meta, StoryObj } from '@storybook/react'
import { useMemo } from 'react'
import type { IRecord } from '@talxis/client-libraries'
import { MapDemo } from '../../../map/MapDemo'
import { createSampleDataset, getSiteRecords, SAMPLE_ATTRIBUTES } from '../../../map/mapSampleData'
import { PIN_RULES } from '../../../map/mapSampleConfig'
import { mapStoryParameters } from '../storyHelpers'

const COORDINATES = {
    LatitudeAttributeName: { raw: SAMPLE_ATTRIBUTES.latitude },
    LongitudeAttributeName: { raw: SAMPLE_ATTRIBUTES.longitude }
}

const INTRO = `
What a pin looks like. Three places decide, tried in order:

1. **\`onResolvePin\`**, a prop, for a wrapper that works the appearance out in code.
2. **A module** that publishes a resolver - the Client API module is one, for a web resource a customizer
   writes.
3. **\`PinRules\`**, a JSON array of rules a maker types into the manifest.

Anything returning nothing falls through to the next, so code refines configuration rather than replacing it.
Selecting a record in the dataset dims every pin outside the selection, on every provider alike.
`

const meta = {
    title: 'Map/Core/Pins',
    tags: ['autodocs'],
    parameters: mapStoryParameters(INTRO)
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const ColouredPins = () => {
    const dataset = useMemo(() => createSampleDataset({ records: getSiteRecords() }), [])
    return (
        <MapDemo
            dataset={dataset}
            parameters={{ ...COORDINATES, PinRules: { raw: PIN_RULES }, DefaultProvider: { raw: 'osm' } }}
        />
    )
}

export const PinAppearance: Story = {
    name: 'A different pin per category',
    render: () => <ColouredPins />,
    parameters: {
        docs: {
            description: {
                story: [
                    'Depots red, service points green, everything else blue. `PinRules` is a JSON array of rules,',
                    'in the shape the legacy MapPicker used, so an existing configuration carries over:',
                    '',
                    '```json',
                    PIN_RULES,
                    '```',
                    '',
                    'Rules are tried in order and the first match wins, so the entry with no `attributeName` is the',
                    'fallback and belongs last. An appearance can also be an image `url`, a `webResourceName` the',
                    'host resolves, or `svg` markup - and the attribute it matches on goes through the same',
                    'dot-notation resolver as every other binding, so a rule can test a related record.'
                ].join('\n')
            }
        }
    }
}

/** A donut showing how full a site is, computed per record - the custom renderer in its simplest form. */
const getCapacityPin = (record: IRecord) => {
    const capacity = Number(record.getValue('capacity')) || 0
    const fullness = Math.min(1, capacity / 600)
    const size = 34
    const radius = 13
    const circumference = 2 * Math.PI * radius
    const colour = fullness > 0.66 ? '#c50f1f' : fullness > 0.33 ? '#f7630c' : '#107c10'
    return {
        width: size,
        height: size,
        title: `${record.getValue('name')} - capacity ${capacity}`,
        svg: `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
            <circle cx="17" cy="17" r="16" fill="#ffffff" stroke="#d1d1d1" />
            <circle cx="17" cy="17" r="${radius}" fill="none" stroke="#edebe9" stroke-width="6" />
            <circle cx="17" cy="17" r="${radius}" fill="none" stroke="${colour}" stroke-width="6"
                    stroke-dasharray="${(circumference * fullness).toFixed(1)} ${circumference.toFixed(1)}"
                    transform="rotate(-90 17 17)" />
        </svg>`
    }
}

const ChartPins = () => {
    const dataset = useMemo(() => createSampleDataset({ records: getSiteRecords() }), [])
    return (
        <MapDemo
            dataset={dataset}
            parameters={{ ...COORDINATES, DefaultProvider: { raw: 'osm' } }}
            onResolvePin={getCapacityPin}
        />
    )
}

export const CustomRenderer: Story = {
    name: 'A chart drawn per record',
    render: () => <ChartPins />,
    parameters: {
        docs: {
            description: {
                story: [
                    'The `onResolvePin` prop works the appearance out in code, so a pin can be anything the record',
                    'justifies. Here every site is a donut of how full it is, green through orange to red.',
                    '',
                    'The markup is inserted as written, so author it in code and never build it out of values a',
                    'user can type.'
                ].join(' ')
            }
        }
    }
}
