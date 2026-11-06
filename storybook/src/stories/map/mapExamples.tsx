import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'

const CITIES_FILE: IGridExampleFile = {
    name: 'data.ts',
    code: `import { DataTypes, MemoryDataProvider } from '@talxis/client-libraries'

//the columns a pin's position is read from
export const FIELD_MAPPING = { latitude: 'lat', longitude: 'lng' }

//latitude and longitude in decimal degrees
const CITIES = [
    { name: 'Prague', lat: 50.0755, lng: 14.4378, population: 1357000 },
    { name: 'Brno', lat: 49.1951, lng: 16.6068, population: 382000 },
    { name: 'Ostrava', lat: 49.8209, lng: 18.2625, population: 284000 },
    { name: 'Warsaw', lat: 52.2297, lng: 21.0122, population: 1863000 },
    { name: 'Krakow', lat: 50.0647, lng: 19.9450, population: 804000 },
    { name: 'Bratislava', lat: 48.1486, lng: 17.1077, population: 475000 },
    { name: 'Budapest', lat: 47.4979, lng: 19.0402, population: 1706000 },
]

export const createCities = () => {
    const provider = new MemoryDataProvider({
        dataSource: CITIES,
        metadata: { PrimaryIdAttribute: 'name', PrimaryNameAttribute: 'name', LogicalName: 'city', QuickFindColumns: ['name'] },
        columns: [
            { name: 'name', displayName: 'City', dataType: DataTypes.SingleLineText },
            { name: 'lat', displayName: 'Latitude', dataType: DataTypes.Decimal },
            { name: 'lng', displayName: 'Longitude', dataType: DataTypes.Decimal },
            { name: 'population', displayName: 'Population', dataType: DataTypes.WholeNone },
        ],
    })
    //the map draws its pins when the records load
    provider.refresh()
    return provider
}
`,
}

const run = (code: string, files: IGridExampleFile[] = []) => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code }, ...files, CITIES_FILE]} tabs={['preview', 'code']} />

const GET_STARTED_CODE = `import { createLeafletModule, DataProviderScope, Leaflet, LeafletMarkers, Map } from '@talxis/base-controls'
import { mergeStyleSets } from '@fluentui/react'
import { createCities, FIELD_MAPPING } from './data'

//the map fills its parent, so the parent sets its size
const styles = mergeStyleSets({
    map: { height: 420 },
})

//the library that draws the map; Leaflet over OpenStreetMap needs no key
const MODULES = [createLeafletModule()]

const GridExample = () => {
    const provider = React.useMemo(createCities, [])

    return <div className={styles.map}>
        <DataProviderScope provider={provider}>
            <Map fieldMapping={FIELD_MAPPING} modules={MODULES}>
                {/* the library's adapter draws the map inside the map's box */}
                <Leaflet>
                    <LeafletMarkers />
                </Leaflet>
            </Map>
        </DataProviderScope>
    </div>
}
`

export const GetStartedExample = () => run(GET_STARTED_CODE)

const DATASET_CONTROL_CODE = `import { createLeafletModule, DatasetControl, Leaflet, LeafletMarkers, Map } from '@talxis/base-controls'
import { createCities, FIELD_MAPPING } from './data'

const MODULES = [createLeafletModule()]

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: createCities() })} height='440px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        {/* shows the control's provider, so the pins follow the search */}
        <Map fieldMapping={FIELD_MAPPING} modules={MODULES}>
            <Leaflet>
                <LeafletMarkers />
            </Leaflet>
        </Map>
    </DatasetControl.Body>
</DatasetControl>
`

export const DatasetControlExample = () => run(DATASET_CONTROL_CODE)

const LIBRARIES_CODE = `import { createGoogleMapsModule, createLeafletModule, DataProviderScope, GoogleMaps, GoogleMapsMarkers, Leaflet, LeafletMarkers, Map } from '@talxis/base-controls'
import { ChoiceGroup, mergeStyleSets, Stack, TextField } from '@fluentui/react'
import { createCities, FIELD_MAPPING } from './data'

const styles = mergeStyleSets({
    map: { height: 400 },
})

//Leaflet over other tiles: a URL template and the attribution the tiles require
const CARTO_LIGHT = {
    tileUrl: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
}

const GridExample = () => {
    const provider = React.useMemo(createCities, [])
    const [library, setLibrary] = React.useState('openStreetMap')
    const [apiKey, setApiKey] = React.useState('')

    //each library is a module and its adapter; the key is read when Google Maps is picked
    const modules = React.useMemo(() => {
        switch (library) {
            case 'carto': return [createLeafletModule(CARTO_LIGHT)]
            case 'google': return [createGoogleMapsModule({ apiKey })]
            default: return [createLeafletModule()]
        }
    }, [library])

    const options = [
        { key: 'openStreetMap', text: 'Leaflet, OpenStreetMap' },
        { key: 'carto', text: 'Leaflet, CARTO light' },
        { key: 'google', text: 'Google Maps', disabled: !apiKey },
    ]

    return <Stack tokens={{ childrenGap: 12 }}>
        <Stack horizontal tokens={{ childrenGap: 24 }} verticalAlign='end'>
            <ChoiceGroup options={options} selectedKey={library} onChange={(_, option) => setLibrary(option!.key)} />
            <TextField label='Google Maps API key' type='password' value={apiKey} onChange={(_, value) => setApiKey(value ?? '')} />
        </Stack>
        <div className={styles.map}>
            <DataProviderScope provider={provider}>
                {/* modules are read at mount, so a new library needs a new key */}
                <Map key={library} fieldMapping={FIELD_MAPPING} modules={modules}>
                    {library === 'google'
                        ? <GoogleMaps><GoogleMapsMarkers /></GoogleMaps>
                        : <Leaflet><LeafletMarkers /></Leaflet>}
                </Map>
            </DataProviderScope>
        </div>
    </Stack>
}
`

export const LibrariesExample = () => run(LIBRARIES_CODE)

const FILTER_CODE = `import { createLeafletModule, DataProviderScope, Leaflet, LeafletMarkers, Map, useMapRecords } from '@talxis/base-controls'
import { mergeStyleSets, Slider, Stack, Text } from '@fluentui/react'
import { createCities, FIELD_MAPPING } from './data'

const styles = mergeStyleSets({
    map: { height: 420 },
})

const MODULES = [createLeafletModule()]

//drawn inside the map, under it; useMapRecords() draws it again when the provider loads new data
const CityCount = () => <Text>{useMapRecords().length} cities on the map</Text>

const GridExample = () => {
    const provider = React.useMemo(createCities, [])
    const [minPopulation, setMinPopulation] = React.useState(0)

    //the map shows the provider's records, so filtering the provider filters the pins
    const onChange = (value: number) => {
        setMinPopulation(value)
        provider.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'population', conditionOperator: Operators.GreaterThanOrEqual.Value, value: String(value) }] })
        provider.refresh()
    }

    return <Stack tokens={{ childrenGap: 8 }}>
        <Slider label='Smallest population' min={0} max={2000000} step={100000} value={minPopulation} valueFormat={value => value.toLocaleString()} onChange={onChange} />
        <div className={styles.map}>
            <DataProviderScope provider={provider}>
                <Map fieldMapping={FIELD_MAPPING} modules={MODULES}>
                    <Leaflet>
                        <LeafletMarkers />
                    </Leaflet>
                    <CityCount />
                </Map>
            </DataProviderScope>
        </div>
    </Stack>
}
`

export const FilterExample = () => run(FILTER_CODE)

const LEAFLET_CODE = `import { createLeafletModule, DataProviderScope, ILeaflet, IMap, Leaflet, LeafletMarkers, Map, useMapModule } from '@talxis/base-controls'
import { DefaultButton, mergeStyleSets, Stack, Text } from '@fluentui/react'
import { createCities, FIELD_MAPPING } from './data'

const styles = mergeStyleSets({
    map: { height: 420 },
})

const MODULES = [createLeafletModule()]

const WorldButton = () => {
    //the library module; getInstance() is Leaflet's own map
    const leaflet = useMapModule('library') as ILeaflet
    return <DefaultButton text='Show the world' onClick={() => leaflet.getInstance()?.setView([20, 0], 2)} />
}

const GridExample = () => {
    const provider = React.useMemo(createCities, [])
    const [clicked, setClicked] = React.useState('Nowhere yet')

    //the modules have loaded, but the adapter has not drawn Leaflet's map yet
    const onLoad = (map: IMap) => {
        const leaflet = map.modules.get('library') as ILeaflet
        leaflet.events.addEventListener('onInstanceReady', instance => {
            instance.on('click', event => setClicked(event.latlng.lat.toFixed(4) + ', ' + event.latlng.lng.toFixed(4)))
        })
    }

    return <Stack tokens={{ childrenGap: 8 }}>
        <Text>Clicked: {clicked}</Text>
        <div className={styles.map}>
            <DataProviderScope provider={provider}>
                <Map fieldMapping={FIELD_MAPPING} modules={MODULES} onLoad={onLoad}>
                    <Leaflet>
                        <LeafletMarkers />
                    </Leaflet>
                    <WorldButton />
                </Map>
            </DataProviderScope>
        </div>
    </Stack>
}
`

export const LeafletInstanceExample = () => run(LEAFLET_CODE)

const CUSTOM_UI_CODE = `import { createLeafletModule, DataProviderScope, ILeafletUiMarkerComponents, IMapComponents, Leaflet, LeafletMarkers, LeafletUiMarkerComponents, Map, MapUiContainerComponents, useMapRecord } from '@talxis/base-controls'
import { mergeStyleSets } from '@fluentui/react'
import { createCities, FIELD_MAPPING } from './data'

const styles = mergeStyleSets({
    map: { height: 420 },
    box: { border: '1px solid #c8c6c4', borderRadius: 8, overflow: 'hidden' },
})

const MODULES = [createLeafletModule()]

//each pin slot gets react-leaflet's own props
type MarkerProps = Parameters<ILeafletUiMarkerComponents['onRenderMarker']>[0]
type PopupProps = Parameters<ILeafletUiMarkerComponents['onRenderPopup']>[0]

//the map's own slot: draws its default box with one more class
const MAP_COMPONENTS: IMapComponents = {
    onRenderContainer: props => MapUiContainerComponents.onRenderContainer({ ...props, className: [props.className, styles.box].join(' ') }),
}

//a large city gets a bigger red circle; the rest keep the default
const CityMarker = (props: MarkerProps) => {
    //the record of the pin being drawn
    const city = useMapRecord()
    if (Number(city.getValue('population')) < 1000000) {
        return LeafletUiMarkerComponents.onRenderMarker(props)
    }
    return LeafletUiMarkerComponents.onRenderMarker({ ...props, radius: 14, pathOptions: { color: '#a4262c' } })
}

const CityPopup = (props: PopupProps) => {
    const city = useMapRecord()
    return LeafletUiMarkerComponents.onRenderPopup({ ...props, children: \`\${city.getValue('name')}: \${Number(city.getValue('population')).toLocaleString()} people\` })
}

//the pins' slots; a component of your own may use hooks
const MARKER_COMPONENTS: Partial<ILeafletUiMarkerComponents> = {
    onRenderMarker: props => <CityMarker {...props} />,
    onRenderPopup: props => <CityPopup {...props} />,
}

const GridExample = () => {
    const provider = React.useMemo(createCities, [])

    return <div className={styles.map}>
        <DataProviderScope provider={provider}>
            <Map fieldMapping={FIELD_MAPPING} modules={MODULES} components={MAP_COMPONENTS}>
                <Leaflet>
                    <LeafletMarkers components={MARKER_COMPONENTS} />
                </Leaflet>
            </Map>
        </DataProviderScope>
    </div>
}
`

export const CustomUiExample = () => run(CUSTOM_UI_CODE)

const CUSTOM_POPUP_CODE = `import { createLeafletModule, DataProviderScope, ILeafletUiMarkerComponents, Leaflet, LeafletMarkers, LeafletUiMarkerComponents, Map, useMap, useMapRecord } from '@talxis/base-controls'
import { Link, mergeStyleSets, Stack, Text } from '@fluentui/react'
import { createCities, FIELD_MAPPING } from './data'

const styles = mergeStyleSets({
    map: { height: 420 },
})

const MODULES = [createLeafletModule()]

//the popup slot gets react-leaflet's own Popup props
type PopupProps = Parameters<ILeafletUiMarkerComponents['onRenderPopup']>[0]

//drawn inside Leaflet's popup, so hooks reach the map and the pin's record
const CityCard = () => {
    const city = useMapRecord()
    const point = useMap().getPoint(city)!
    const osm = \`https://www.openstreetmap.org/?mlat=\${point.latitude}&mlon=\${point.longitude}#map=12/\${point.latitude}/\${point.longitude}\`

    return <Stack tokens={{ childrenGap: 4 }}>
        <Text variant='large'>{city.getValue('name')}</Text>
        <Text>{Number(city.getValue('population')).toLocaleString()} people</Text>
        <Text variant='small'>{point.latitude.toFixed(4)}, {point.longitude.toFixed(4)}</Text>
        <Link href={osm} target='_blank'>Open in OpenStreetMap</Link>
    </Stack>
}

//keeps the default popup and its props, with a card of your own inside
const MARKER_COMPONENTS: Partial<ILeafletUiMarkerComponents> = {
    onRenderPopup: (props: PopupProps) => LeafletUiMarkerComponents.onRenderPopup({ ...props, minWidth: 180, children: <CityCard /> }),
}

const GridExample = () => {
    const provider = React.useMemo(createCities, [])

    return <div className={styles.map}>
        <DataProviderScope provider={provider}>
            <Map fieldMapping={FIELD_MAPPING} modules={MODULES}>
                <Leaflet>
                    <LeafletMarkers components={MARKER_COMPONENTS} />
                </Leaflet>
            </Map>
        </DataProviderScope>
    </div>
}
`

export const CustomPopupExample = () => run(CUSTOM_POPUP_CODE)

const DOT_MAP_FILE: IGridExampleFile = {
    name: 'DotMap.tsx',
    code: `import { IMapBounds, IMapLibrary, IMapModule, IMapPoint, IMapViewRequest, useMap, useMapModule, useMapRecords } from '@talxis/base-controls'
import { mergeStyleSets } from '@fluentui/react'

const WIDTH = 800
const HEIGHT = 420

const styles = mergeStyleSets({
    svg: { flex: 1, minHeight: 0, width: '100%', background: '#eef3f8' },
    label: { fontSize: 13, fill: '#323130' },
})

//the library's own map is the svg the adapter draws
class DotMapRuntime implements IMapLibrary {
    public svg: SVGSVGElement | null = null

    public getInstance() {
        return this.svg
    }
}

//the map needs one module named library
export const createDotMapModule = (): IMapModule => ({
    name: 'library',
    onLoad: () => new DotMapRuntime(),
})

interface IView {
    center: IMapPoint
    zoom: number
}

//pixels per degree, counting zoom as tiled maps do: zoom 0 is the world in 256 pixels
const getScale = (zoom: number) => 256 * 2 ** zoom / 360

const toView = (request: IMapViewRequest): IView => {
    if ('center' in request) {
        return request
    }
    const { north, south, east, west } = request.bounds
    return {
        center: { latitude: (north + south) / 2, longitude: (east + west) / 2 },
        zoom: Math.log2(Math.min((WIDTH - 2 * request.padding) / (east - west), (HEIGHT - 2 * request.padding) / (north - south)) * 360 / 256),
    }
}

export const DotMap = () => {
    const map = useMap()
    const dotMap = useMapModule('library') as DotMapRuntime
    //draws again each time the provider loads new data
    const records = useMapRecords()
    const [view, setView] = React.useState<IView>({ center: { latitude: 0, longitude: 0 }, zoom: 1 })

    //the map asks for a new view through its viewport; ask once for the records already loaded
    React.useEffect(() => {
        const viewport = map.services.get('viewport')
        const stop = viewport.events.addEventListener('onViewRequested', request => setView(toView(request)))
        viewport.fit()
        return stop
    }, [map])

    const scale = getScale(view.zoom)
    const toX = (longitude: number) => WIDTH / 2 + (longitude - view.center.longitude) * scale
    const toY = (latitude: number) => HEIGHT / 2 - (latitude - view.center.latitude) * scale

    return <svg ref={svg => { dotMap.svg = svg }} viewBox={'0 0 ' + WIDTH + ' ' + HEIGHT} className={styles.svg}>
        {records.map(record => {
            const point = map.getPoint(record)!
            return <g key={record.getRecordId()}>
                <circle cx={toX(point.longitude)} cy={toY(point.latitude)} r={6} fill='#0078d4' />
                <text x={toX(point.longitude) + 10} y={toY(point.latitude) + 4} className={styles.label}>{record.getRecordId()}</text>
            </g>
        })}
    </svg>
}
`,
}

const OWN_LIBRARY_CODE = `import { DataProviderScope, Map } from '@talxis/base-controls'
import { mergeStyleSets } from '@fluentui/react'
import { createDotMapModule, DotMap } from './DotMap'
import { createCities, FIELD_MAPPING } from './data'

const styles = mergeStyleSets({
    map: { height: 420 },
})

//the library of your own, in place of createLeafletModule()
const MODULES = [createDotMapModule()]

const GridExample = () => {
    const provider = React.useMemo(createCities, [])

    return <div className={styles.map}>
        <DataProviderScope provider={provider}>
            <Map fieldMapping={FIELD_MAPPING} modules={MODULES}>
                <DotMap />
            </Map>
        </DataProviderScope>
    </div>
}
`

export const OwnLibraryExample = () => run(OWN_LIBRARY_CODE, [DOT_MAP_FILE])
