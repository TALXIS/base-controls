import type { Meta, StoryObj } from '@storybook/react'
import { useMemo } from 'react'
import { Map, createGoogleMapsProvider } from '@talxis/base-controls/components/Map'
import { usePcfContext } from '@talxis/base-controls/utils'
import { createLeafletMapProvider } from './LeafletMapProvider'
import { mapPinMetadata, useSampleMapDataset } from './useSampleMapDataset'

interface IMapDemoProps {
    apiKey: string
}

const MapDemo = ({ apiKey }: IMapDemoProps) => {
    const context = usePcfContext()
    const dataset = useSampleMapDataset()
    const mapProvider = useMemo(
        () => (apiKey ? createGoogleMapsProvider({ apiKey }) : createLeafletMapProvider()),
        [apiKey],
    )

    return (
        <div style={{ height: 480, padding: 18 }}>
            <Map
                context={context}
                parameters={{
                    Dataset: dataset,
                    PinMetadata: mapPinMetadata,
                    MapProvider: mapProvider,
                }}
            />
        </div>
    )
}

const meta = {
    title: 'Map/Overview',
    component: MapDemo,
    tags: ['autodocs'],
    argTypes: {
        apiKey: {
            control: 'text',
            description: 'Optional Google Maps JavaScript API key. Leave empty to use the built-in Leaflet/OpenStreetMap provider (no key needed); paste your own key to switch to the real GoogleMapsProvider. Kept only in this browser tab — never persisted or committed.',
        },
    },
    args: {
        apiKey: '',
    },
    parameters: {
        docs: {
            story: { inline: true },
            description: {
                component: 'Renders pins from a bound dataset. Uses a keyless Leaflet/OpenStreetMap provider by default; paste a Google Maps API key into the "apiKey" control below to switch to the real GoogleMapsProvider.',
            },
        },
    },
} satisfies Meta<typeof MapDemo>

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
    name: 'Overview',
}
