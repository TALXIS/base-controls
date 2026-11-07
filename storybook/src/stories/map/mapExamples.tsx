import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'

const CITIES_FILE: IGridExampleFile = {
    name: 'data.ts',
    code: `import { DataTypes, MemoryDataProvider } from '@talxis/client-libraries'

//the columns a pin's position is read from
export const FIELD_MAPPING = { latitude: 'lat', longitude: 'lng' }

export const WISHLIST = 1
export const VISITED = 2

//option sets: each option's colour is the colour of its tag
const REGIONS = [
    { Value: 1, Label: 'Northern Europe', Color: '#4f6bed' },
    { Value: 2, Label: 'Western Europe', Color: '#038387' },
    { Value: 3, Label: 'Southern Europe', Color: '#ca5010' },
    { Value: 4, Label: 'Eastern Europe', Color: '#8764b8' },
]
const STATUSES = [
    { Value: WISHLIST, Label: 'Wishlist', Color: '#0078d4' },
    { Value: VISITED, Label: 'Visited', Color: '#107c10' },
]

export const COLUMNS = [
    { name: 'name', displayName: 'Capital', dataType: DataTypes.SingleLineText, isPrimary: true },
    { name: 'country', displayName: 'Country', dataType: DataTypes.SingleLineText },
    { name: 'lat', displayName: 'Latitude', dataType: DataTypes.Decimal },
    { name: 'lng', displayName: 'Longitude', dataType: DataTypes.Decimal },
    { name: 'population', displayName: 'Population', dataType: DataTypes.WholeNone },
    { name: 'euSince', displayName: 'EU member since', dataType: DataTypes.WholeNone },
    { name: 'region', displayName: 'Region', dataType: DataTypes.OptionSet, metadata: { OptionSet: REGIONS } },
    { name: 'status', displayName: 'Trip', dataType: DataTypes.OptionSet, metadata: { OptionSet: STATUSES } },
]

//the capitals of the EU, with latitude and longitude in decimal degrees
const CAPITALS = [
    { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041, population: 918000, euSince: 1958, region: 2, status: VISITED },
    { name: 'Athens', country: 'Greece', lat: 37.9838, lng: 23.7275, population: 643000, euSince: 1981, region: 3, status: WISHLIST },
    { name: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, population: 3755000, euSince: 1958, region: 2, status: VISITED },
    { name: 'Bratislava', country: 'Slovakia', lat: 48.1486, lng: 17.1077, population: 475000, euSince: 2004, region: 4, status: VISITED },
    { name: 'Brussels', country: 'Belgium', lat: 50.8503, lng: 4.3517, population: 1222000, euSince: 1958, region: 2, status: WISHLIST },
    { name: 'Bucharest', country: 'Romania', lat: 44.4268, lng: 26.1025, population: 1716000, euSince: 2007, region: 4, status: WISHLIST },
    { name: 'Budapest', country: 'Hungary', lat: 47.4979, lng: 19.0402, population: 1706000, euSince: 2004, region: 4, status: VISITED },
    { name: 'Copenhagen', country: 'Denmark', lat: 55.6761, lng: 12.5683, population: 660000, euSince: 1973, region: 1, status: WISHLIST },
    { name: 'Dublin', country: 'Ireland', lat: 53.3498, lng: -6.2603, population: 592000, euSince: 1973, region: 1, status: WISHLIST },
    { name: 'Helsinki', country: 'Finland', lat: 60.1699, lng: 24.9384, population: 674000, euSince: 1995, region: 1, status: WISHLIST },
    { name: 'Lisbon', country: 'Portugal', lat: 38.7223, lng: -9.1393, population: 545000, euSince: 1986, region: 3, status: WISHLIST },
    { name: 'Ljubljana', country: 'Slovenia', lat: 46.0569, lng: 14.5058, population: 295000, euSince: 2004, region: 3, status: WISHLIST },
    { name: 'Luxembourg', country: 'Luxembourg', lat: 49.6116, lng: 6.1319, population: 134000, euSince: 1958, region: 2, status: WISHLIST },
    { name: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038, population: 3332000, euSince: 1986, region: 3, status: WISHLIST },
    { name: 'Nicosia', country: 'Cyprus', lat: 35.1856, lng: 33.3823, population: 330000, euSince: 2004, region: 3, status: WISHLIST },
    { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, population: 2103000, euSince: 1958, region: 2, status: VISITED },
    { name: 'Prague', country: 'Czechia', lat: 50.0755, lng: 14.4378, population: 1357000, euSince: 2004, region: 4, status: VISITED },
    { name: 'Riga', country: 'Latvia', lat: 56.9496, lng: 24.1052, population: 605000, euSince: 2004, region: 1, status: WISHLIST },
    { name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, population: 2748000, euSince: 1958, region: 3, status: VISITED },
    { name: 'Sofia', country: 'Bulgaria', lat: 42.6977, lng: 23.3219, population: 1236000, euSince: 2007, region: 4, status: WISHLIST },
    { name: 'Stockholm', country: 'Sweden', lat: 59.3293, lng: 18.0686, population: 984000, euSince: 1995, region: 1, status: WISHLIST },
    { name: 'Tallinn', country: 'Estonia', lat: 59.4370, lng: 24.7536, population: 454000, euSince: 2004, region: 1, status: WISHLIST },
    { name: 'Valletta', country: 'Malta', lat: 35.8989, lng: 14.5146, population: 6000, euSince: 2004, region: 3, status: WISHLIST },
    { name: 'Vienna', country: 'Austria', lat: 48.2082, lng: 16.3738, population: 2005000, euSince: 1995, region: 2, status: VISITED },
    { name: 'Vilnius', country: 'Lithuania', lat: 54.6872, lng: 25.2797, population: 588000, euSince: 2004, region: 1, status: WISHLIST },
    { name: 'Warsaw', country: 'Poland', lat: 52.2297, lng: 21.0122, population: 1863000, euSince: 2004, region: 4, status: WISHLIST },
    { name: 'Zagreb', country: 'Croatia', lat: 45.8150, lng: 15.9819, population: 767000, euSince: 2013, region: 3, status: WISHLIST },
]

//every provider shares the rows, so a saved change outlives a remount
export const createCitiesProvider = () => {
    const provider = new MemoryDataProvider({
        dataSource: CAPITALS,
        metadata: { PrimaryIdAttribute: 'name', PrimaryNameAttribute: 'name', LogicalName: 'capital', QuickFindColumns: ['name', 'country'] },
        columns: COLUMNS,
    })
    //TEMPORARY: every load takes 5s, to see the map's loading overlay
    const getDataAsync = provider.getDataAsync.bind(provider)
    provider.getDataAsync = async (...args: Parameters<typeof getDataAsync>) => {
        await new Promise(resolve => setTimeout(resolve, 5000))
        return getDataAsync(...args)
    }
    return provider
}

//loaded once for a map on its own; a DatasetControl loads its provider itself
export const createCities = () => {
    const provider = createCitiesProvider()
    provider.refresh()
    return provider
}
`,
}

const LIBRARY_PICKER_FILE: IGridExampleFile = {
    name: 'LibraryPicker.tsx',
    code: `import { createGoogleMapsModule, createLeafletModule, IGoogleMapsComponents, ILeafletComponents, IMapModule } from '@talxis/base-controls'
import { mergeStyleSets, Pivot, PivotItem, Stack, TextField } from '@fluentui/react'

export type MapLibrary = 'leaflet' | 'googleMaps'

export interface ILibraryPickerParameters {
    //both libraries take the marker slots in the same shape
    components?: ILeafletComponents & IGoogleMapsComponents
    //Leaflet's tiles; OpenStreetMap's when left out
    tileUrl?: string
    attribution?: string
}

//kept for the browser tab, so every example starts on the library and key picked last
const API_KEY_ITEM = 'mapDocs.googleMapsApiKey'
const LIBRARY_ITEM = 'mapDocs.library'

const styles = mergeStyleSets({
    picker: { minHeight: 40 },
    key: { width: 300 },
})

export const useLibraryPicker = (parameters: ILibraryPickerParameters = {}) => {
    const [apiKey, setApiKey] = React.useState(() => sessionStorage.getItem(API_KEY_ITEM) ?? '')
    const [name, setName] = React.useState<MapLibrary>(() => apiKey && sessionStorage.getItem(LIBRARY_ITEM) === 'googleMaps' ? 'googleMaps' : 'leaflet')

    //the library is a module of the map; Google Maps reads the key when it is picked
    const modules: IMapModule[] = React.useMemo(() => name === 'googleMaps'
        ? [createGoogleMapsModule({ apiKey, components: parameters.components })]
        : [createLeafletModule({ tileUrl: parameters.tileUrl, attribution: parameters.attribution, components: parameters.components })], [name, parameters.tileUrl])

    const onNameChange = (next: MapLibrary) => {
        setName(next)
        sessionStorage.setItem(LIBRARY_ITEM, next)
    }
    const onApiKeyChange = (next: string) => {
        setApiKey(next)
        sessionStorage.setItem(API_KEY_ITEM, next)
    }

    //a tab per library; Google Maps opens once a key is pasted
    const picker = <Stack horizontal wrap horizontalAlign='space-between' verticalAlign='center' tokens={{ childrenGap: 12 }} className={styles.picker}>
        <Pivot linkFormat='tabs' selectedKey={name} onLinkClick={item => item && onNameChange(item.props.itemKey as MapLibrary)}>
            <PivotItem itemKey='leaflet' headerText='Leaflet' itemIcon='Nav2DMapView' />
            <PivotItem itemKey='googleMaps' headerText='Google Maps' itemIcon='MapPin' headerButtonProps={{ disabled: !apiKey, title: apiKey ? undefined : 'Paste a Google Maps API key first' }} />
        </Pivot>
        <TextField className={styles.key} type='password' canRevealPassword autoComplete='off' data-bwignore data-1p-ignore data-lpignore='true' placeholder='Paste a Google Maps API key' ariaLabel='Google Maps API key' value={apiKey} onChange={(_, value) => onApiKeyChange(value ?? '')} />
    </Stack>

    //the map reads its modules as it mounts, so new modules need a new key
    return { name, modules, mountKey: name + (parameters.tileUrl ?? ''), picker }
}
`,
}

const run = (code: string, ...files: IGridExampleFile[]) => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code }, ...files, LIBRARY_PICKER_FILE, CITIES_FILE]} tabs={['preview', 'code']} />

const GET_STARTED_CODE = `import { DataProviderScope, Map } from '@talxis/base-controls'
import { mergeStyleSets, Stack } from '@fluentui/react'
import { createCities, FIELD_MAPPING } from './data'
import { useLibraryPicker } from './LibraryPicker'

//the map fills its parent, so the parent sets its size
const styles = mergeStyleSets({
    map: { height: 440 },
})

const GridExample = () => {
    const provider = React.useMemo(createCities, [])
    //the modules: createLeafletModule(), or createGoogleMapsModule({ apiKey }) under your key
    const library = useLibraryPicker()

    return <Stack tokens={{ childrenGap: 12 }}>
        {library.picker}
        <div className={styles.map}>
            {/* the map shows the records of the provider around it */}
            <DataProviderScope provider={provider}>
                <Map key={library.mountKey} fieldMapping={FIELD_MAPPING} modules={library.modules} />
            </DataProviderScope>
        </div>
    </Stack>
}
`

export const GetStartedExample = () => run(GET_STARTED_CODE)

const LAYOUT_CODE = `import { DataProviderScope, Map } from '@talxis/base-controls'
import { mergeStyleSets, Slider, Stack } from '@fluentui/react'
import { createCities, FIELD_MAPPING } from './data'
import { useLibraryPicker } from './LibraryPicker'

const styles = mergeStyleSets({
    //a flex column with a height; the map takes all of it
    panel: { display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #c8c6c4', borderRadius: 8 },
})

const GridExample = () => {
    const provider = React.useMemo(createCities, [])
    const library = useLibraryPicker()
    const [containerHeight, setContainerHeight] = React.useState(440)

    return <Stack tokens={{ childrenGap: 12 }}>
        {library.picker}
        <Slider label='Container height' min={220} max={700} step={20} value={containerHeight} onChange={setContainerHeight} showValue valueFormat={value => value + 'px'} styles={{ root: { width: 300 } }} />
        <div className={styles.panel} style={{ height: containerHeight }}>
            <DataProviderScope provider={provider}>
                {/* no height: the map takes the space its parent gives it */}
                <Map key={library.mountKey} fieldMapping={FIELD_MAPPING} modules={library.modules} />
            </DataProviderScope>
        </div>
    </Stack>
}
`

export const LayoutExample = () => run(LAYOUT_CODE)

const TILES_CODE = `import { DataProviderScope, Map } from '@talxis/base-controls'
import { Dropdown, mergeStyleSets, Stack } from '@fluentui/react'
import { createCities, FIELD_MAPPING } from './data'
import { useLibraryPicker } from './LibraryPicker'

const styles = mergeStyleSets({
    map: { height: 440 },
    tiles: { width: 240 },
})

const OSM = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
const CARTO = OSM + ' &copy; <a href="https://carto.com/attributions">CARTO</a>'

//a tile URL template, and the credit the tile service asks you to show
const TILES = [
    { key: 'openStreetMap', text: 'OpenStreetMap', tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: OSM },
    { key: 'positron', text: 'CARTO Positron', tileUrl: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', attribution: CARTO },
    { key: 'darkMatter', text: 'CARTO Dark Matter', tileUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attribution: CARTO },
    { key: 'topo', text: 'OpenTopoMap', tileUrl: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attribution: OSM + ', SRTM | &copy; <a href="https://opentopomap.org">OpenTopoMap</a>' },
]

const GridExample = () => {
    const provider = React.useMemo(createCities, [])
    const [tiles, setTiles] = React.useState(TILES[1])
    //createLeafletModule({ tileUrl, attribution }); Google Maps draws its own tiles
    const library = useLibraryPicker({ tileUrl: tiles.tileUrl, attribution: tiles.attribution })

    return <Stack tokens={{ childrenGap: 12 }}>
        {library.picker}
        <Dropdown label='Leaflet tiles' className={styles.tiles} options={TILES} selectedKey={tiles.key} disabled={library.name !== 'leaflet'} onChange={(_, option) => setTiles(option as typeof tiles)} />
        <div className={styles.map}>
            <DataProviderScope provider={provider}>
                {/* the key changes with the tiles too, so the map mounts again with them */}
                <Map key={library.mountKey} fieldMapping={FIELD_MAPPING} modules={library.modules} />
            </DataProviderScope>
        </div>
    </Stack>
}
`

export const TilesExample = () => run(TILES_CODE)

const ENLARGEMENT_CODE = `import { DataProviderScope, IMap, Map, useMapRecords } from '@talxis/base-controls'
import { Operators, Type } from '@talxis/client-libraries'
import { mergeStyleSets, Slider, Stack, Text } from '@fluentui/react'
import { createCities, FIELD_MAPPING } from './data'
import { useLibraryPicker } from './LibraryPicker'

const styles = mergeStyleSets({
    map: { height: 440 },
    count: { padding: '6px 12px' },
})

//useMapRecords() draws it again each time the provider loads new data
const MemberCount = () => <Text className={styles.count}>{useMapRecords().length} member states</Text>

//called with each new map, before it loads
const onSetup = (map: IMap) => {
    //a surface: a component of yours in the map's box, under the map
    map.surfaces.hooks.surfaces.add(surfaces => {
        surfaces.push({ key: 'memberCount', onRender: () => <MemberCount /> })
    })
}

const GridExample = () => {
    const provider = React.useMemo(createCities, [])
    const library = useLibraryPicker()
    const [year, setYear] = React.useState(2013)

    //the pins are the provider's records, so filtering the provider filters the pins
    const onYearChange = (value: number) => {
        setYear(value)
        provider.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'euSince', conditionOperator: Operators.LessThanOrEqual.Value, value: String(value) }] })
        provider.refresh()
    }

    return <Stack tokens={{ childrenGap: 12 }}>
        {library.picker}
        <Slider label='The EU in' min={1958} max={2013} value={year} onChange={onYearChange} />
        <div className={styles.map}>
            <DataProviderScope provider={provider}>
                <Map key={library.mountKey} fieldMapping={FIELD_MAPPING} modules={library.modules} onSetup={onSetup} />
            </DataProviderScope>
        </div>
    </Stack>
}
`

export const EnlargementExample = () => run(ENLARGEMENT_CODE)

const TOUR_CODE = `import { DataProviderScope, IGoogleMaps, ILeaflet, IMap, IMapPoint, Map, useMap, useMapRecords } from '@talxis/base-controls'
import { DefaultButton, mergeStyleSets, PrimaryButton, Stack, Text } from '@fluentui/react'
import { createCities, FIELD_MAPPING } from './data'
import { MapLibrary, useLibraryPicker } from './LibraryPicker'

const styles = mergeStyleSets({
    map: { height: 480 },
})

const CITY_ZOOM = 11

//each library moves its own map: a Leaflet Map, or a google.maps.Map
const flyTo = (map: IMap, library: MapLibrary, { latitude, longitude }: IMapPoint) => {
    if (library === 'leaflet') {
        (map.modules.get('library') as ILeaflet).getInstance()?.flyTo([latitude, longitude], CITY_ZOOM)
        return
    }
    const googleMap = (map.modules.get('library') as IGoogleMaps).getInstance()
    googleMap?.panTo({ lat: latitude, lng: longitude })
    googleMap?.setZoom(CITY_ZOOM)
}

const Tour = (props: { library: MapLibrary }) => {
    const map = useMap()
    const stops = useMapRecords().sort((a, b) => map.getPoint(a)!.longitude - map.getPoint(b)!.longitude)
    const [stop, setStop] = React.useState(-1)

    const next = () => {
        const index = (stop + 1) % stops.length
        setStop(index)
        flyTo(map, props.library, map.getPoint(stops[index])!)
    }

    //the viewport asks the library for the view that fits every pin
    const showAll = () => {
        setStop(-1)
        map.services.get('viewport').fit()
    }

    return <Stack horizontal verticalAlign='center' tokens={{ childrenGap: 8, padding: 8 }}>
        <PrimaryButton text='Next capital' iconProps={{ iconName: 'Airplane' }} onClick={next} />
        <DefaultButton text='Show all' onClick={showAll} />
        <Text>{stop >= 0 ? stops[stop].getFormattedValue('name') : 'West to east'}</Text>
    </Stack>
}

const GridExample = () => {
    const provider = React.useMemo(createCities, [])
    const library = useLibraryPicker()

    //the tour sits under the map, told which library draws it
    const onSetup = (map: IMap) => {
        map.surfaces.hooks.surfaces.add(surfaces => {
            surfaces.push({ key: 'tour', onRender: () => <Tour library={library.name} /> })
        })
    }

    return <Stack tokens={{ childrenGap: 12 }}>
        {library.picker}
        <div className={styles.map}>
            <DataProviderScope provider={provider}>
                <Map key={library.mountKey} fieldMapping={FIELD_MAPPING} modules={library.modules} onSetup={onSetup} />
            </DataProviderScope>
        </div>
    </Stack>
}
`

export const TourExample = () => run(TOUR_CODE)

const REGION_PINS_CODE = `import { DataProviderScope, IGoogleMapsComponents, ILeafletComponents, IMapUiMarkerPinProps, Map, useMap, useMapRecord } from '@talxis/base-controls'
import { Icon, mergeStyleSets, Stack } from '@fluentui/react'
import { createCities, FIELD_MAPPING } from './data'
import { useLibraryPicker } from './LibraryPicker'

const styles = mergeStyleSets({
    map: { height: 440 },
    //the dot sits in the turned teardrop, so the star turns back upright
    star: { color: 'white', fontSize: 12, transform: 'rotate(45deg)' },
})

//the teardrop in the colour of the capital's region
const RegionPin = (props: IMapUiMarkerPinProps) => {
    //the record of the pin being drawn
    const record = useMapRecord()
    const regions = useMap().services.get('provider').getColumnsMap().region.metadata?.OptionSet ?? []
    const color = regions.find(region => region.Value === Number(record.getValue('region')))?.Color
    return <Map.Ui.MarkerPin {...props} color={color} />
}

//a star in place of the white dot for a capital of two million or more
const CapitalDot = (props: React.HTMLAttributes<HTMLDivElement>) => {
    const isLarge = Number(useMapRecord().getValue('population')) >= 2000000
    return isLarge ? <Icon iconName='FavoriteStarFill' className={styles.star} /> : <div {...props} />
}

//the same slots for either library; a component of yours may use hooks
const COMPONENTS: ILeafletComponents & IGoogleMapsComponents = {
    marker: {
        pin: {
            onRenderPin: props => <RegionPin {...props} />,
            onRenderDot: props => <CapitalDot {...props} />,
        },
    },
}

const GridExample = () => {
    const provider = React.useMemo(createCities, [])
    //the library module takes the slots: createLeafletModule({ components })
    const library = useLibraryPicker({ components: COMPONENTS })

    return <Stack tokens={{ childrenGap: 12 }}>
        {library.picker}
        <div className={styles.map}>
            <DataProviderScope provider={provider}>
                <Map key={library.mountKey} fieldMapping={FIELD_MAPPING} modules={library.modules} />
            </DataProviderScope>
        </div>
    </Stack>
}
`

export const RegionPinsExample = () => run(REGION_PINS_CODE)

const POSTCARD_CODE = `import { DataProviderScope, IGoogleMapsComponents, ILeafletComponents, Map, RecordCardFieldRow, RecordCardProgress, useMapRecord, useMapRecords } from '@talxis/base-controls'
import { Link, mergeStyleSets, Stack } from '@fluentui/react'
import { createCities, FIELD_MAPPING } from './data'
import { useLibraryPicker } from './LibraryPicker'

const styles = mergeStyleSets({
    map: { height: 480 },
    link: { display: 'block', marginTop: 8 },
})

//drawn inside the library's popup, so Map.Popup's parts and the hooks reach the pin's record
const Postcard = () => {
    const capital = useMapRecord()
    const largest = useMapRecords().reduce((a, b) => Number(a.getValue('population')) >= Number(b.getValue('population')) ? a : b)
    const name = capital.getFormattedValue('name')
    const share = Number(capital.getValue('population')) / Number(largest.getValue('population')) * 100

    return <Map.Popup.Card>
        {/* the region beside the name, as a tag in its option's colour */}
        <Map.Popup.Header statusColumnName='region' />
        <Map.Popup.FieldRows>
            <Map.Popup.FieldRow columnName='country' iconName='Flag' />
            <Map.Popup.FieldRow columnName='population' iconName='People' />
            {/* the shared RecordCard parts take any value */}
            <RecordCardFieldRow label='In the EU since' iconName='Calendar'>{capital.getValue('euSince')}</RecordCardFieldRow>
        </Map.Popup.FieldRows>
        <RecordCardProgress percent={share} text={\`\${Math.round(share)}% of \${largest.getFormattedValue('name')}\`} />
        <Link className={styles.link} href={\`https://en.wikipedia.org/wiki/\${name}\`} target='_blank'>Read about {name}</Link>
    </Map.Popup.Card>
}

//the whole popup, in place of Map.Popup.Renderer
const COMPONENTS: ILeafletComponents & IGoogleMapsComponents = {
    marker: { popup: { onRender: () => <Postcard /> } },
}

const GridExample = () => {
    const provider = React.useMemo(createCities, [])
    const library = useLibraryPicker({ components: COMPONENTS })

    return <Stack tokens={{ childrenGap: 12 }}>
        {library.picker}
        <div className={styles.map}>
            <DataProviderScope provider={provider}>
                <Map key={library.mountKey} fieldMapping={FIELD_MAPPING} modules={library.modules} />
            </DataProviderScope>
        </div>
    </Stack>
}
`

export const PostcardExample = () => run(POSTCARD_CODE)

const BOARDING_PASS_CODE = `import { DataProviderScope, IGoogleMapsComponents, ILeafletComponents, IMapPoint, Map, useMap, useMapRecord, useMapRecords, useTheme } from '@talxis/base-controls'
import { FontWeights, Icon, ITheme, mergeStyleSets, Stack, Text } from '@fluentui/react'
import { createCities, FIELD_MAPPING } from './data'
import { useLibraryPicker } from './LibraryPicker'

const HOME = 'Prague'
const CRUISE_SPEED_KMH = 800
const TAXI_AND_CLIMB_MINUTES = 30

const pageStyles = mergeStyleSets({
    map: { height: 480 },
})

//nothing here comes from the map: the whole popup is yours
const getStyles = (theme: ITheme, color: string) => mergeStyleSets({
    pass: { width: 280, overflow: 'hidden', borderRadius: 6, fontFamily: theme.fonts.medium.fontFamily },
    //the region's colour, lit at the top left
    band: { padding: '12px 16px', color: '#ffffff', background: \`linear-gradient(120deg, rgba(255, 255, 255, 0.18), rgba(0, 0, 0, 0.22)), \${color}\` },
    //Fluent's Text sets a colour of its own
    caption: { color: '#ffffff', fontSize: 12, fontWeight: FontWeights.semibold, letterSpacing: 2, textTransform: 'uppercase', textShadow: '0 1px 2px rgba(0, 0, 0, 0.25)' },
    bandIcon: { color: '#ffffff', fontSize: 16 },
    route: { padding: '14px 16px 4px' },
    code: { fontSize: 30, fontWeight: FontWeights.bold, letterSpacing: 1, lineHeight: '34px' },
    plane: { fontSize: 18, color },
    city: { fontSize: 12, color: theme.semanticColors.bodySubtext },
    facts: { padding: '10px 16px 14px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', rowGap: 2 },
    label: { fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: theme.semanticColors.bodySubtext },
    value: { fontSize: 14, fontWeight: FontWeights.semibold },
    //the tear-off line, with a notch cut on each side in the popup's own colour
    perforation: {
        position: 'relative',
        borderTop: \`2px dashed \${theme.semanticColors.bodyDivider}\`,
        selectors: {
            '::before, ::after': { content: '""', position: 'absolute', top: -9, width: 16, height: 16, borderRadius: '50%', background: theme.semanticColors.bodyBackground },
            '::before': { left: -8 },
            '::after': { right: -8 },
        },
    },
    stub: { padding: '12px 16px 14px' },
    barcode: { height: 34, background: \`repeating-linear-gradient(90deg, \${theme.semanticColors.bodyText} 0 2px, transparent 2px 4px, \${theme.semanticColors.bodyText} 4px 5px, transparent 5px 8px)\` },
})

//great-circle distance in kilometres
const getDistance = (from: IMapPoint, to: IMapPoint) => {
    const toRadians = (degrees: number) => degrees * Math.PI / 180
    const latitude = toRadians(to.latitude - from.latitude)
    const longitude = toRadians(to.longitude - from.longitude)
    const a = Math.sin(latitude / 2) ** 2 + Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(longitude / 2) ** 2
    return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const toCode = (name: string) => name.slice(0, 3).toUpperCase()

//the same capital always gets the same gate and seat
const getGate = (name: string) => 'ABCD'[name.length % 4] + ((name.charCodeAt(0) * 7) % 40 + 1)
const getSeat = (name: string) => ((name.charCodeAt(1) % 30) + 1) + 'ABCDEF'[name.length % 6]

const BoardingPass = () => {
    const theme = useTheme()
    const map = useMap()
    const capital = useMapRecord()
    const home = useMapRecords().find(record => record.getValue('name') === HOME)!
    //the band takes the colour of the capital's region
    const regions = map.services.get('provider').getColumnsMap().region.metadata?.OptionSet ?? []
    const color = regions.find(region => region.Value === Number(capital.getValue('region')))?.Color ?? theme.palette.themePrimary
    const styles = React.useMemo(() => getStyles(theme, color), [theme, color])

    const name = String(capital.getValue('name'))
    const kilometres = Math.round(getDistance(map.getPoint(home)!, map.getPoint(capital)!))
    const minutes = Math.round(kilometres / CRUISE_SPEED_KMH * 60) + TAXI_AND_CLIMB_MINUTES

    if (name === HOME) {
        return <div className={styles.pass}>
            <div className={styles.band}><Text className={styles.caption}>Home base</Text></div>
            <Stack horizontal verticalAlign='center' tokens={{ childrenGap: 10 }} className={styles.route}>
                <Icon iconName='Home' className={styles.plane} />
                <Text className={styles.code}>{toCode(name)}</Text>
            </Stack>
            <Text block className={styles.stub}>Every trip starts here. Pick another capital to fly to it.</Text>
        </div>
    }

    return <div className={styles.pass}>
        <Stack horizontal horizontalAlign='space-between' verticalAlign='center' className={styles.band}>
            <Text className={styles.caption}>Boarding pass</Text>
            <Icon iconName='Airplane' className={styles.bandIcon} />
        </Stack>
        <Stack horizontal horizontalAlign='space-between' verticalAlign='center' className={styles.route}>
            <Stack><Text className={styles.code}>{toCode(HOME)}</Text><Text className={styles.city}>{HOME}</Text></Stack>
            <Icon iconName='AirplaneSolid' className={styles.plane} />
            <Stack horizontalAlign='end'><Text className={styles.code}>{toCode(name)}</Text><Text className={styles.city}>{name}</Text></Stack>
        </Stack>
        <div className={styles.facts}>
            <Text className={styles.label}>Distance</Text><Text className={styles.label}>Flight</Text><Text className={styles.label}>Gate</Text><Text className={styles.label}>Seat</Text>
            <Text className={styles.value}>{kilometres.toLocaleString()} km</Text>
            <Text className={styles.value}>{Math.floor(minutes / 60)}h {minutes % 60}m</Text>
            <Text className={styles.value}>{getGate(name)}</Text>
            <Text className={styles.value}>{getSeat(name)}</Text>
        </div>
        <div className={styles.perforation} />
        <div className={styles.stub}>
            <div className={styles.barcode} />
        </div>
    </div>
}

//the whole popup, in place of Map.Popup.Renderer
const COMPONENTS: ILeafletComponents & IGoogleMapsComponents = {
    marker: { popup: { onRender: () => <BoardingPass /> } },
}

const GridExample = () => {
    const provider = React.useMemo(createCities, [])
    const library = useLibraryPicker({ components: COMPONENTS })

    return <Stack tokens={{ childrenGap: 12 }}>
        {library.picker}
        <div className={pageStyles.map}>
            <DataProviderScope provider={provider}>
                <Map key={library.mountKey} fieldMapping={FIELD_MAPPING} modules={library.modules} />
            </DataProviderScope>
        </div>
    </Stack>
}
`

export const BoardingPassExample = () => run(BOARDING_PASS_CODE)

const TRIP_CODE = `import { DatasetControl, Map } from '@talxis/base-controls'
import { Stack } from '@fluentui/react'
import { FIELD_MAPPING } from './data'
import { loadTrip } from './views'
import { TripRibbon } from './TripRibbon'
import { COMPONENTS } from './CityCard'
import { useLibraryPicker } from './LibraryPicker'

const GridExample = () => {
    //the pins and popups of CityCard.tsx, for either library
    const library = useLibraryPicker({ components: COMPONENTS })

    return <Stack tokens={{ childrenGap: 12 }}>
        {library.picker}
        {/* a map in place of the table while the control loads */}
        <DatasetControl onLoad={loadTrip} height='560px' components={{ skeleton: { onRenderSkeleton: props => <Map.Ui.Skeleton {...props} /> } }}>
            <DatasetControl.Header>
                <DatasetControl.Header.Start>
                    <DatasetControl.ViewSwitcher />
                </DatasetControl.Header.Start>
                <DatasetControl.Header.End>
                    <TripRibbon />
                    <DatasetControl.EditColumns />
                    <DatasetControl.QuickFind />
                </DatasetControl.Header.End>
            </DatasetControl.Header>
            <DatasetControl.Body>
                {/* takes no provider of its own: it shows the control's */}
                <Map key={library.mountKey} fieldMapping={FIELD_MAPPING} modules={library.modules} />
            </DatasetControl.Body>
        </DatasetControl>
    </Stack>
}
`

const TRIP_VIEWS_FILE: IGridExampleFile = {
    name: 'views.ts',
    code: `import { IDatasetControlLoadResult, IDatasetControlView } from '@talxis/base-controls'
import { Operators, Type } from '@talxis/client-libraries'
import { COLUMNS, createCitiesProvider, VISITED, WISHLIST } from './data'

const getColumn = (name: string) => COLUMNS.find(column => column.name === name)!
//the columns a view shows, in the order it shows them
const shown = (...names: string[]) => names.map((name, order) => ({ ...getColumn(name), order }))
//loaded for the pins and the popup's header, never shown
const READ_BY_THE_MAP = ['lat', 'lng', 'status'].map(name => ({ ...getColumn(name), isHidden: true }))

const TRIP = { id: 'trip', name: 'My trip' }

const filterByStatus = (provider: IDataProvider, status: number) => {
    provider.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'status', conditionOperator: Operators.Equal.Value, value: String(status) }] })
}

const VIEWS: IDatasetControlView[] = [
    { id: 'all', name: 'All capitals', resolve: () => ({ columns: [...shown('name', 'country', 'population'), ...READ_BY_THE_MAP] }) },
    {
        id: 'large',
        name: 'Over a million people',
        resolve: provider => {
            provider.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'population', conditionOperator: Operators.GreaterThanOrEqual.Value, value: '1000000' }] })
            return { columns: [...shown('name', 'population'), ...READ_BY_THE_MAP] }
        },
    },
    {
        id: 'wishlist',
        name: 'Wishlist',
        group: TRIP,
        resolve: provider => {
            filterByStatus(provider, WISHLIST)
            return { columns: [...shown('name', 'country', 'region'), ...READ_BY_THE_MAP] }
        },
    },
    {
        id: 'visited',
        name: 'Visited',
        group: TRIP,
        resolve: provider => {
            filterByStatus(provider, VISITED)
            return { columns: [...shown('name', 'country'), ...READ_BY_THE_MAP] }
        },
    },
]

export const loadTrip = async (): Promise<IDatasetControlLoadResult> => {
    const provider = createCitiesProvider()
    //what Edit columns offers: a memory provider lists the columns of its saved queries
    provider.setMetadata({ ...provider.getMetadata(), SavedQueries: [{ columns: ['name', 'country', 'population', 'region'].map(getColumn) }] })
    return { provider, views: VIEWS }
}
`,
}

const TRIP_RIBBON_FILE: IGridExampleFile = {
    name: 'TripRibbon.tsx',
    code: `import { DatasetControl, IRibbonCommand, useDataProvider } from '@talxis/base-controls'
import { VISITED, WISHLIST } from './data'

export const TripRibbon = () => {
    const provider = useDataProvider()

    //saved at once, so it leaves no unsaved changes behind
    const setStatus = async (capitals: IRecord[], status: number) => {
        capitals.forEach(capital => capital.setValue('status', status))
        await provider.save(capitals)
    }

    //DatasetControl.Ribbon calls onLoad again on every selection, such as one made in a popup
    const onLoad = async (): Promise<IRibbonCommand[]> => {
        const capitals = provider.getSelectedRecordIds().map(id => provider.getRecordsMap()[id])
        if (capitals.length === 0) {
            return []
        }
        return [
            { id: 'markVisited', label: \`Mark \${capitals.length} as visited\`, iconName: 'CheckMark', onExecute: () => setStatus(capitals, VISITED) },
            { id: 'backToWishlist', label: 'Back to the wishlist', iconName: 'Heart', onExecute: () => setStatus(capitals, WISHLIST) },
            { id: 'clearSelection', label: 'Clear selection', iconName: 'Clear', onExecute: () => provider.clearSelectedRecordIds() },
        ]
    }

    //Refresh loads the view again, so a city that left its view goes
    return <DatasetControl.Ribbon enableRefresh onLoad={onLoad} />
}
`,
}

const CITY_CARD_FILE: IGridExampleFile = {
    name: 'CityCard.tsx',
    code: `import { IGoogleMapsComponents, ILeafletComponents, IMapUiMarkerPinProps, Map, useDataProviderEvents, useMapRecord } from '@talxis/base-controls'
import { Link, mergeStyleSets } from '@fluentui/react'

const SELECTED_COLOR = '#323130'

const styles = mergeStyleSets({
    select: { display: 'block', marginTop: 8 },
})

//the pin's record and whether it is in the control's selection
const useCity = () => {
    const record = useMapRecord()
    //the control's provider; draws again when the selection or a value changes
    const provider = useDataProviderEvents(['onRecordsSelected', 'onRecordColumnValueChanged'])
    const id = record.getRecordId()
    const selectedIds = provider.getSelectedRecordIds()
    const isSelected = selectedIds.includes(id)
    const toggle = () => provider.setSelectedRecordIds(isSelected ? selectedIds.filter(selectedId => selectedId !== id) : [...selectedIds, id])
    return { record, provider, isSelected, toggle }
}

//dark while selected, otherwise in the colour of the trip status
const CityPin = (props: IMapUiMarkerPinProps) => {
    const { record, provider, isSelected } = useCity()
    const statuses = provider.getColumnsMap().status.metadata?.OptionSet ?? []
    const color = isSelected ? SELECTED_COLOR : statuses.find(status => status.Value === Number(record.getValue('status')))?.Color
    return <Map.Ui.MarkerPin {...props} color={color} />
}

//a row for each column the view shows now, so Edit columns changes the popup
const CityCard = () => {
    const { provider, isSelected, toggle } = useCity()
    //the name is in the header; the hidden columns are the ones the map reads
    const columns = provider.getColumns().filter(column => !column.isHidden && !column.isPrimary)

    return <Map.Popup.Card>
        <Map.Popup.Header statusColumnName='status' />
        <Map.Popup.FieldRows>
            {columns.map(column => <Map.Popup.FieldRow key={column.name} columnName={column.name} />)}
        </Map.Popup.FieldRows>
        <Link className={styles.select} onClick={toggle}>{isSelected ? 'Deselect' : 'Select'}</Link>
    </Map.Popup.Card>
}

export const COMPONENTS: ILeafletComponents & IGoogleMapsComponents = {
    marker: {
        pin: { onRenderPin: props => <CityPin {...props} /> },
        popup: { onRender: () => <CityCard /> },
    },
}
`,
}

export const TripPlannerExample = () => run(TRIP_CODE, TRIP_VIEWS_FILE, TRIP_RIBBON_FILE, CITY_CARD_FILE)
