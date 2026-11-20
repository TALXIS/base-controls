import type { Meta, StoryObj } from '@storybook/react'
import { useMemo } from 'react'
import type { IColumn } from '@talxis/client-libraries'
import { DataTypes } from '@talxis/client-libraries'
import { createEditingModule } from '@talxis/base-controls/components/Map/modules/editing'
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
The map can **write** as well as draw. Both gestures are off unless the module is asked for them, because a
map that moves records when a finger slips is worse than one that does not move them at all.

\`\`\`tsx
modules={{
    editing: createEditingModule({
        allowDrag: true,
        allowCreate: true,
        addressAttributes: { fullAddress: 'address', city: 'city', street: 'street', streetAndNumber: 'streetLine', postalCode: 'postalCode', country: 'country' }
    })
}}
\`\`\`

Everything a record gains from the map - the coordinates it was dropped at, and the address that point turned
out to be - goes through \`record.setValue\` and \`record.save()\` on the bound dataset, so the host's own
validation, auditing and business rules run exactly as they would for a form. The address components are
\`fullAddress\`, \`country\`, \`region\`, \`city\`, \`district\`, \`street\`, \`streetAndNumber\`, \`streetNumber\` and
\`postalCode\`; bind the ones the record has.
`

const meta = {
    title: 'Map/Modules/Editing',
    tags: ['autodocs'],
    parameters: mapStoryParameters(INTRO)
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const ADDRESS_COLUMNS: IColumn[] = [
    { name: 'country', alias: 'country', displayName: 'Country', dataType: DataTypes.SingleLineText, order: 20, visualSizeFactor: 120 },
    { name: 'region', alias: 'region', displayName: 'Region', dataType: DataTypes.SingleLineText, order: 21, visualSizeFactor: 120 },
    { name: 'district', alias: 'district', displayName: 'District', dataType: DataTypes.SingleLineText, order: 22, visualSizeFactor: 120 },
    { name: 'street', alias: 'street', displayName: 'Street', dataType: DataTypes.SingleLineText, order: 23, visualSizeFactor: 140 },
    { name: 'streetLine', alias: 'streetLine', displayName: 'Street line', dataType: DataTypes.SingleLineText, order: 24, visualSizeFactor: 160 },
    { name: 'streetNumber', alias: 'streetNumber', displayName: 'Number', dataType: DataTypes.SingleLineText, order: 25, visualSizeFactor: 100 },
    { name: 'postalCode', alias: 'postalCode', displayName: 'Postal code', dataType: DataTypes.SingleLineText, order: 26, visualSizeFactor: 100 }
]

const DRAG = { editing: createEditingModule({ allowDrag: true }) }

const DragPins = () => {
    const dataset = useMemo(() => createSampleDataset({ records: getSiteRecords().slice(0, 5) }), [])
    return (
        <MapDemo
            dataset={dataset}
            modules={DRAG}
            height={420}
            parameters={{ ...COORDINATES, DefaultProvider: { raw: 'osm' } }}>
            <RecordTable dataset={dataset} columns={['name', 'lat', 'lng']} />
        </MapDemo>
    )
}

export const DragAPin: Story = {
    name: 'Move a record by dragging its pin',
    render: () => <DragPins />,
    parameters: {
        docs: {
            description: {
                story: [
                    '`allowDrag` lets a pin be dragged, and dropping it writes the new coordinates back to the',
                    'record and saves. The table under the map is the dataset, so you can watch the values change',
                    'as you drop a pin. The status message says "Saving..." while the write round-trips.'
                ].join(' ')
            }
        }
    }
}

const CREATE = {
    editing: createEditingModule({
        allowDrag: true,
        allowCreate: true,
        addressAttributes: {
            fullAddress: 'address',
            country: 'country',
            region: 'region',
            city: 'city',
            district: 'district',
            street: 'street',
            streetAndNumber: 'streetLine',
            streetNumber: 'streetNumber',
            postalCode: 'postalCode'
        }
    })
}

const CreatePins = () => {
    const dataset = useMemo(() => createSampleDataset({
        records: [],
        columns: [
            { name: 'name', alias: 'name', displayName: 'Name', dataType: DataTypes.SingleLineText, order: 0, visualSizeFactor: 160, isPrimary: true },
            { name: 'address', alias: 'address', displayName: 'Address', dataType: DataTypes.SingleLineText, order: 1, visualSizeFactor: 240 },
            { name: 'city', alias: 'city', displayName: 'City', dataType: DataTypes.SingleLineText, order: 2, visualSizeFactor: 120 },
            ...ADDRESS_COLUMNS,
            { name: 'lat', alias: 'lat', displayName: 'Latitude', dataType: DataTypes.Decimal, order: 30, visualSizeFactor: 100 },
            { name: 'lng', alias: 'lng', displayName: 'Longitude', dataType: DataTypes.Decimal, order: 31, visualSizeFactor: 100 }
        ]
    }), [])
    return (
        <MapDemo
            dataset={dataset}
            modules={CREATE}
            height={400}
            parameters={{ ...COORDINATES, DefaultProvider: { raw: preferredProvider('here') } }}
            //an empty dataset has nothing to fit, so the map opens on the country the sample data lives in
            viewportOptions={{ fallbackZoom: 7 }}>
            <RecordTable dataset={dataset} columns={['streetLine', 'city', 'postalCode', 'country', 'lat', 'lng']} />
        </MapDemo>
    )
}

export const CreateAPin: Story = {
    name: 'Create a record by clicking the map',
    render: () => <CreatePins />,
    parameters: {
        docs: {
            description: {
                story: [
                    '`allowCreate` turns a click on empty map into a new record in the bound dataset. The module',
                    'reverse geo-codes the point and writes the components back to whichever attributes are bound -',
                    'so a click is a usable way to fill an address in. Watch the table fill.',
                    '',
                    'With the cards module on, the pin the map created shows a **Delete** button on its card. A',
                    'component the service could not resolve is written as empty rather than skipped, so moving a',
                    'pin from a street address into a field clears the street instead of leaving the old one behind.'
                ].join(' ')
            }
        }
    }
}
