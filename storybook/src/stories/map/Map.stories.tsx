import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Stack, TextField, Toggle } from '@fluentui/react'
import { Map, createGoogleMapsProvider, usePcfContext } from '@talxis/base-controls'
import { renderStory } from '../form/storyHelpers'
import { gridDocsPage } from '../../grid/gridDocsPage'
import { createLeafletMapProvider } from './LeafletMapProvider'
import { mapPinMetadata, useSampleMapDataset } from './useSampleMapDataset'

const DESCRIPTION = `
Map shows the records of a dataset as pins. Each record's position comes from the two columns \`PinMetadata\` names, \`LatitudeAttributeName\` and \`LongitudeAttributeName\`, and the map redraws its pins whenever the dataset loads new records. What draws the map is a *map provider*: \`createGoogleMapsProvider({ apiKey })\` for Google Maps, or a component of your own that takes the \`locations\` and draws them. Try: switch the pins off and on.

{{story: Pins from a dataset}}

## Google Maps

The example draws with a keyless Leaflet and OpenStreetMap provider of its own; paste a Google Maps JavaScript API key above to switch it to \`createGoogleMapsProvider\`. Use a referrer-restricted test key, not a production one.
`

const MapDemo = () => {
    const context = usePcfContext()
    const [apiKey, setApiKey] = React.useState('')
    const [showPins, setShowPins] = React.useState(true)
    const dataset = useSampleMapDataset(showPins)
    const mapProvider = React.useMemo(() => apiKey ? createGoogleMapsProvider({ apiKey }) : createLeafletMapProvider(), [apiKey])

    return <Stack tokens={{ childrenGap: 12 }}>
        <Stack horizontal wrap verticalAlign='end' tokens={{ childrenGap: 16 }}>
            <TextField label='Google Maps API key' placeholder='Empty for Leaflet' type='password' value={apiKey} onChange={(_, value) => setApiKey(value ?? '')} />
            <Toggle label='Pins' checked={showPins} onChange={(_, checked) => setShowPins(!!checked)} />
        </Stack>
        <div style={{ height: 480 }}>
            <Map context={context} parameters={{ Dataset: dataset, PinMetadata: mapPinMetadata, MapProvider: mapProvider }} />
        </div>
    </Stack>
}

const meta = {
    title: 'Controls/Map/Get started',
    tags: ['autodocs'],
    parameters: {
        controls: { disable: true },
        docs: {
            page: gridDocsPage(DESCRIPTION),
            story: { inline: true },
            canvas: { sourceState: 'none', additionalActions: [] },
        },
    },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const PinsFromADataset: Story = {
    name: 'Pins from a dataset',
    render: () => renderStory(<MapDemo />),
    parameters: {
        docs: {
            description: {
                story: `Four cities from a \`MemoryDataProvider\`, drawn by Leaflet until you paste a Google Maps key.`,
            },
        },
    },
}
