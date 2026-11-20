import type { Meta, StoryObj } from '@storybook/react'
import { useMemo } from 'react'
import { MapDemo } from '../../map/MapDemo'
import { PIN_RULES } from '../../map/mapSampleConfig'
import { createSampleDataset, getSiteRecords, SAMPLE_ATTRIBUTES } from '../../map/mapSampleData'
import { mapStoryParameters } from './storyHelpers'

const PARAMETERS = 'Core parameters'

interface IOverviewProps {
    defaultProvider: 'osm' | 'here' | 'mapy' | 'google'
    enableProviderSwitching: boolean
    showPointsOfInterest: boolean
    colourPinsByCategory: boolean
    loadAllPages: boolean
}

const OverviewPlayground = (props: IOverviewProps) => {
    const dataset = useMemo(() => createSampleDataset({ records: getSiteRecords(), pageSize: 6 }), [])
    return (
        <MapDemo
            dataset={dataset}
            height={560}
            parameters={{
                LatitudeAttributeName: { raw: SAMPLE_ATTRIBUTES.latitude },
                LongitudeAttributeName: { raw: SAMPLE_ATTRIBUTES.longitude },
                DefaultProvider: { raw: props.defaultProvider },
                EnableProviderSwitching: { raw: props.enableProviderSwitching },
                ShowPointsOfInterest: { raw: props.showPointsOfInterest },
                PinRules: { raw: props.colourPinsByCategory ? PIN_RULES : '' },
                PinLoading: { raw: props.loadAllPages ? 'all' : 'page' }
            }}
        />
    )
}

const INTRO = `
Draws the records of a bound dataset as pins on a map. The **core** reads coordinates off the records,
decides what a pin looks like and where the map looks, and hands both to a **provider** that draws it.
Everything else - search, filters, cards, routes, clustering, editing, a legend - is a **module** the host
turns on by passing it in, so a map ships only what it uses.

This page is the core alone: fifteen sites, a dataset paged six at a time, and nothing but pins. Every
switch below is a core parameter. The modules each have a page of their own under **Modules**.

**OpenStreetMap needs no key**, so everything here works as it stands. To see HERE, Mapy.com and Google
Maps, paste your own keys into the **Api keys** panel above the map - they stay in your browser, and every
map on every page redraws with them.

\`\`\`tsx
import { Map } from '@talxis/base-controls';
import { googleMapsProvider } from '@talxis/base-controls/components/Map/providers/google-maps';

<Map
    context={pcfContext}
    parameters={{
        Dataset: dataset,
        LatitudeAttributeName: { raw: 'lat' },
        LongitudeAttributeName: { raw: 'lng' },
        GoogleApiKey: { raw: apiKey }
    }}
    providers={[googleMapsProvider]}
/>
\`\`\`

The full API - props, parameters, outputs, the module and provider seams - is in
[the control's README](https://github.com/TALXIS/base-controls/blob/master/src/components/Map/README.md).
`

const meta = {
    title: 'Map/Overview',
    component: OverviewPlayground,
    tags: ['autodocs'],
    argTypes: {
        defaultProvider: {
            control: 'inline-radio',
            options: ['osm', 'here', 'mapy', 'google'],
            table: { category: PARAMETERS },
            description: 'The provider the map opens with. One whose api key is not filled in falls back to OpenStreetMap and warns.'
        },
        enableProviderSwitching: {
            control: 'boolean',
            table: { category: PARAMETERS },
            description: 'Whether the picker offers every configured provider, or the map draws the default alone.'
        },
        showPointsOfInterest: {
            control: 'boolean',
            table: { category: PARAMETERS },
            description: 'Whether the map draws the shops and landmarks its provider knows about. Off by default, so the only pins are the records.'
        },
        colourPinsByCategory: {
            control: 'boolean',
            table: { category: PARAMETERS },
            description: 'Applies `PinRules`: depots red, service points green, everything else blue.'
        },
        loadAllPages: {
            control: 'boolean',
            table: { category: PARAMETERS },
            description: 'Whether every page of the view is drawn, or only the six records the host loaded.'
        }
    },
    args: {
        defaultProvider: 'osm',
        enableProviderSwitching: true,
        showPointsOfInterest: false,
        colourPinsByCategory: true,
        loadAllPages: true
    },
    parameters: mapStoryParameters(INTRO)
} satisfies Meta<typeof OverviewPlayground>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
    parameters: {
        docs: {
            description: {
                story: [
                    'Click a pin to select its record; ctrl-click adds to the selection, and the pins outside it dim.',
                    'Pan and zoom, and the readout under the map shows what the control reported as its `Viewport`',
                    'output. Pick another provider in the corner and the new map opens on the view the last one was',
                    'showing.'
                ].join(' ')
            }
        }
    }
}
