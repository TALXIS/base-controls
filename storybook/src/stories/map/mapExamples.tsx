import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'

type CapitalField = 'country' | 'population' | 'euSince' | 'region' | 'status'

interface ICapital {
    name: string
    country: string
    lat: number
    lng: number
    population: number
    euSince: number
    region: number
    isVisited: boolean
}

//the capitals of the EU; each example's data.ts holds only the fields it reads
const CAPITALS: ICapital[] = [
    { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041, population: 918000, euSince: 1958, region: 2, isVisited: true },
    { name: 'Athens', country: 'Greece', lat: 37.9838, lng: 23.7275, population: 643000, euSince: 1981, region: 3, isVisited: false },
    { name: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.405, population: 3755000, euSince: 1958, region: 2, isVisited: true },
    { name: 'Bratislava', country: 'Slovakia', lat: 48.1486, lng: 17.1077, population: 475000, euSince: 2004, region: 4, isVisited: true },
    { name: 'Brussels', country: 'Belgium', lat: 50.8503, lng: 4.3517, population: 1222000, euSince: 1958, region: 2, isVisited: false },
    { name: 'Bucharest', country: 'Romania', lat: 44.4268, lng: 26.1025, population: 1716000, euSince: 2007, region: 4, isVisited: false },
    { name: 'Budapest', country: 'Hungary', lat: 47.4979, lng: 19.0402, population: 1706000, euSince: 2004, region: 4, isVisited: true },
    { name: 'Copenhagen', country: 'Denmark', lat: 55.6761, lng: 12.5683, population: 660000, euSince: 1973, region: 1, isVisited: false },
    { name: 'Dublin', country: 'Ireland', lat: 53.3498, lng: -6.2603, population: 592000, euSince: 1973, region: 1, isVisited: false },
    { name: 'Helsinki', country: 'Finland', lat: 60.1699, lng: 24.9384, population: 674000, euSince: 1995, region: 1, isVisited: false },
    { name: 'Lisbon', country: 'Portugal', lat: 38.7223, lng: -9.1393, population: 545000, euSince: 1986, region: 3, isVisited: false },
    { name: 'Ljubljana', country: 'Slovenia', lat: 46.0569, lng: 14.5058, population: 295000, euSince: 2004, region: 3, isVisited: false },
    { name: 'Luxembourg', country: 'Luxembourg', lat: 49.6116, lng: 6.1319, population: 134000, euSince: 1958, region: 2, isVisited: false },
    { name: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038, population: 3332000, euSince: 1986, region: 3, isVisited: false },
    { name: 'Nicosia', country: 'Cyprus', lat: 35.1856, lng: 33.3823, population: 330000, euSince: 2004, region: 3, isVisited: false },
    { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, population: 2103000, euSince: 1958, region: 2, isVisited: true },
    { name: 'Prague', country: 'Czechia', lat: 50.0755, lng: 14.4378, population: 1357000, euSince: 2004, region: 4, isVisited: true },
    { name: 'Riga', country: 'Latvia', lat: 56.9496, lng: 24.1052, population: 605000, euSince: 2004, region: 1, isVisited: false },
    { name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, population: 2748000, euSince: 1958, region: 3, isVisited: true },
    { name: 'Sofia', country: 'Bulgaria', lat: 42.6977, lng: 23.3219, population: 1236000, euSince: 2007, region: 4, isVisited: false },
    { name: 'Stockholm', country: 'Sweden', lat: 59.3293, lng: 18.0686, population: 984000, euSince: 1995, region: 1, isVisited: false },
    { name: 'Tallinn', country: 'Estonia', lat: 59.437, lng: 24.7536, population: 454000, euSince: 2004, region: 1, isVisited: false },
    { name: 'Valletta', country: 'Malta', lat: 35.8989, lng: 14.5146, population: 6000, euSince: 2004, region: 3, isVisited: false },
    { name: 'Vienna', country: 'Austria', lat: 48.2082, lng: 16.3738, population: 2005000, euSince: 1995, region: 2, isVisited: true },
    { name: 'Vilnius', country: 'Lithuania', lat: 54.6872, lng: 25.2797, population: 588000, euSince: 2004, region: 1, isVisited: false },
    { name: 'Warsaw', country: 'Poland', lat: 52.2297, lng: 21.0122, population: 1863000, euSince: 2004, region: 4, isVisited: false },
    { name: 'Zagreb', country: 'Croatia', lat: 45.815, lng: 15.9819, population: 767000, euSince: 2013, region: 3, isVisited: false },
]

const COLUMN_CODE: { [field in CapitalField]: string } = {
    country: `{ name: 'country', displayName: 'Country', dataType: DataTypes.SingleLineText }`,
    population: `{ name: 'population', displayName: 'Population', dataType: DataTypes.WholeNone }`,
    euSince: `{ name: 'euSince', displayName: 'EU member since', dataType: DataTypes.WholeNone }`,
    region: `{ name: 'region', displayName: 'Region', dataType: DataTypes.OptionSet, metadata: { OptionSet: REGIONS } }`,
    status: `{ name: 'status', displayName: 'Trip', dataType: DataTypes.OptionSet, metadata: { OptionSet: STATUSES } }`,
}

const formatValue = (capital: ICapital, field: string) => {
    if (field === 'status') {
        return capital.isVisited ? 'VISITED' : 'WISHLIST'
    }
    const value = capital[field as keyof ICapital]
    return typeof value === 'string' ? `'${value}'` : String(value)
}

const formatCapitals = (fields: CapitalField[]) => {
    const keys = ['name', ...fields.filter(field => field === 'country'), 'lat', 'lng', ...fields.filter(field => field !== 'country')]
    return CAPITALS.map(capital => `    { ${keys.map(key => `${key}: ${formatValue(capital, key)}`).join(', ')} },`).join('\n')
}

const formatColumns = (fields: CapitalField[]) => [
    `{ name: 'name', displayName: 'Capital', dataType: DataTypes.SingleLineText, isPrimary: true }`,
    ...fields.filter(field => field === 'country').map(field => COLUMN_CODE[field]),
    `{ name: 'lat', displayName: 'Latitude', dataType: DataTypes.Decimal }`,
    `{ name: 'lng', displayName: 'Longitude', dataType: DataTypes.Decimal }`,
    ...fields.filter(field => field !== 'country').map(field => COLUMN_CODE[field]),
]

const REGIONS_CODE = `//an option set: each option's colour is the colour of its tag
const REGIONS = [
    { Value: 1, Label: 'Northern Europe', Color: '#4f6bed' },
    { Value: 2, Label: 'Western Europe', Color: '#038387' },
    { Value: 3, Label: 'Southern Europe', Color: '#ca5010' },
    { Value: 4, Label: 'Eastern Europe', Color: '#8764b8' },
]

`

//a provider of the capitals, loaded once for a map on its own
const citiesFile = (...fields: CapitalField[]): IGridExampleFile => ({
    name: 'data.ts',
    code: `import { DataTypes, MemoryDataProvider } from '@talxis/client-libraries'

//the columns a pin's position is read from
export const FIELD_MAPPING = { latitude: 'lat', longitude: 'lng' }

${fields.includes('region') ? REGIONS_CODE : ''}//the capitals of the EU, with latitude and longitude in decimal degrees
const CAPITALS = [
${formatCapitals(fields)}
]

export const cities = new MemoryDataProvider({
    dataSource: CAPITALS,
    metadata: { PrimaryIdAttribute: 'name', PrimaryNameAttribute: 'name', LogicalName: 'capital' },
    columns: [
${formatColumns(fields).map(column => `        ${column},`).join('\n')}
    ],
})
cities.refresh()
`,
})

const run = (code: string, data: IGridExampleFile) => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code }, data]} tabs={['preview', 'code']} />

const GET_STARTED_CODE = `import { DataProviderScope, LeafletMap } from '@talxis/base-controls'
import { cities, FIELD_MAPPING } from './data'

//the map shows the records of the provider around it
const GridExample = () => <DataProviderScope provider={cities}>
    <LeafletMap fieldMapping={FIELD_MAPPING} height='440px' />
</DataProviderScope>
`

export const GetStartedExample = () => run(GET_STARTED_CODE, citiesFile())

const LAYOUT_CODE = `import { DataProviderScope, LeafletMap } from '@talxis/base-controls'
import { Slider } from '@fluentui/react'
import { cities, FIELD_MAPPING } from './data'

const GridExample = () => {
    const [containerHeight, setContainerHeight] = React.useState(440)

    return <>
        <Slider label='Container height' min={220} max={700} step={20} value={containerHeight} onChange={setContainerHeight} valueFormat={value => value + 'px'} />
        {/* a flex column with a height; the map takes all of it */}
        <div style={{ display: 'flex', flexDirection: 'column', height: containerHeight }}>
            <DataProviderScope provider={cities}>
                {/* no height: the map takes the space its parent gives it */}
                <LeafletMap fieldMapping={FIELD_MAPPING} />
            </DataProviderScope>
        </div>
    </>
}
`

export const LayoutExample = () => run(LAYOUT_CODE, citiesFile())

const TILES_CODE = `import { DataProviderScope, GoogleMap, LeafletMap } from '@talxis/base-controls'
import { Dropdown, Pivot, PivotItem, TextField } from '@fluentui/react'
import { cities, FIELD_MAPPING } from './data'

const CARTO = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'

//a tile URL template and the credit its service asks for; left out, OpenStreetMap's
const TILES = [
    { key: 'openStreetMap', text: 'OpenStreetMap' },
    { key: 'positron', text: 'CARTO Positron', tileUrl: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', attribution: CARTO },
    { key: 'darkMatter', text: 'CARTO Dark Matter', tileUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attribution: CARTO },
]

const GridExample = () => {
    const [tiles, setTiles] = React.useState(TILES[0])
    const [apiKey, setApiKey] = React.useState('')

    return <DataProviderScope provider={cities}>
        <Pivot>
            <PivotItem headerText='Leaflet'>
                <Dropdown label='Leaflet tiles' options={TILES} selectedKey={tiles.key} onChange={(_, option) => setTiles(option as typeof tiles)} />
                {/* new tiles mount the map again */}
                <LeafletMap fieldMapping={FIELD_MAPPING} tileUrl={tiles.tileUrl} attribution={tiles.attribution} height='440px' />
            </PivotItem>
            <PivotItem headerText='Google Maps'>
                {/* the Maps API loads once per page, under the first key it gets */}
                <TextField label='Google Maps API key' placeholder='Paste a key, then press Enter' type='password' canRevealPassword onKeyDown={event => event.key === 'Enter' && setApiKey(event.currentTarget.value)} />
                {apiKey && <GoogleMap fieldMapping={FIELD_MAPPING} apiKey={apiKey} height='440px' />}
            </PivotItem>
        </Pivot>
    </DataProviderScope>
}
`

export const TilesExample = () => run(TILES_CODE, citiesFile())

const ENLARGEMENT_CODE = `import { DataProviderScope, LeafletMap, useMapRecords } from '@talxis/base-controls'
import { Operators, Type } from '@talxis/client-libraries'
import { Slider, Text } from '@fluentui/react'
import { cities, FIELD_MAPPING } from './data'

//useMapRecords() draws it again each time the provider loads new data
const MemberCount = () => <Text>{useMapRecords().length} member states</Text>

//the pins are the provider's records, so filtering the provider filters the pins
const onYearChange = (year: number) => {
    cities.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'euSince', conditionOperator: Operators.LessThanOrEqual.Value, value: String(year) }] })
    cities.refresh()
}

const GridExample = () => <>
    <Slider label='The EU in' min={1958} max={2013} defaultValue={2013} onChange={onYearChange} />
    <DataProviderScope provider={cities}>
        {/* a child is drawn in the map's box, under the map */}
        <LeafletMap fieldMapping={FIELD_MAPPING} height='440px'>
            <MemberCount />
        </LeafletMap>
    </DataProviderScope>
</>
`

export const EnlargementExample = () => run(ENLARGEMENT_CODE, citiesFile('euSince'))

const TOUR_CODE = `import { DataProviderScope, ILeaflet, LeafletMap, useMap, useMapRecords } from '@talxis/base-controls'
import { DefaultButton, PrimaryButton, Stack } from '@fluentui/react'
import { cities, FIELD_MAPPING } from './data'

const Tour = () => {
    const map = useMap()
    const stops = useMapRecords().sort((a, b) => map.getPoint(a)!.longitude - map.getPoint(b)!.longitude)
    const stop = React.useRef(-1)

    //the library's own map, here a Leaflet Map, flies to the next capital to the east
    const next = () => {
        stop.current = (stop.current + 1) % stops.length
        const { latitude, longitude } = map.getPoint(stops[stop.current])!
        const leaflet = (map.modules.get('library') as ILeaflet).getInstance()
        leaflet?.flyTo([latitude, longitude], 11)
    }

    //the viewport asks the library for the view that fits every pin
    const showAll = () => {
        stop.current = -1
        map.services.get('viewport').fit()
    }

    return <Stack horizontal tokens={{ childrenGap: 8 }}>
        <PrimaryButton text='Next capital' onClick={next} />
        <DefaultButton text='Show all' onClick={showAll} />
    </Stack>
}

const GridExample = () => <DataProviderScope provider={cities}>
    {/* drawn under the map, where the hooks reach it */}
    <LeafletMap fieldMapping={FIELD_MAPPING} height='480px'>
        <Tour />
    </LeafletMap>
</DataProviderScope>
`

export const TourExample = () => run(TOUR_CODE, citiesFile())

const REGION_PINS_CODE = `import { DataProviderScope, IMapUiMarkerPinProps, LeafletMap, Map, useMap, useMapRecord } from '@talxis/base-controls'
import { Icon } from '@fluentui/react'
import { cities, FIELD_MAPPING } from './data'

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
    //turned back upright inside the turned teardrop
    return isLarge ? <Icon iconName='FavoriteStarFill' style={{ color: 'white', fontSize: 12, transform: 'rotate(45deg)' }} /> : <div {...props} />
}

const GridExample = () => <DataProviderScope provider={cities}>
    {/* a slot may draw a component of yours, which may use hooks */}
    <LeafletMap fieldMapping={FIELD_MAPPING} height='440px' components={{
        marker: { pin: { onRenderPin: props => <RegionPin {...props} />, onRenderDot: props => <CapitalDot {...props} /> } },
    }} />
</DataProviderScope>
`

export const RegionPinsExample = () => run(REGION_PINS_CODE, citiesFile('population', 'region'))

const POSTCARD_CODE = `import { DataProviderScope, LeafletMap, Map, RecordCardFieldRow, RecordCardProgress, useMapRecord, useMapRecords } from '@talxis/base-controls'
import { cities, FIELD_MAPPING } from './data'

//drawn inside the pin's popup, so Map.Popup's parts and the hooks reach the pin's record
const Postcard = () => {
    const capital = useMapRecord()
    const largest = useMapRecords().reduce((a, b) => Number(a.getValue('population')) >= Number(b.getValue('population')) ? a : b)
    const share = Number(capital.getValue('population')) / Number(largest.getValue('population')) * 100

    return <Map.Popup.Card>
        {/* the region beside the name, as a tag in its option's colour */}
        <Map.Popup.Header statusColumnName='region' />
        <Map.Popup.FieldRows>
            <Map.Popup.FieldRow columnName='country' iconName='Flag' />
            {/* the shared RecordCard parts take any value */}
            <RecordCardFieldRow label='In the EU since' iconName='Calendar'>{capital.getValue('euSince')}</RecordCardFieldRow>
        </Map.Popup.FieldRows>
        <RecordCardProgress percent={share} text={\`\${Math.round(share)}% of \${largest.getFormattedValue('name')}\`} />
    </Map.Popup.Card>
}

const GridExample = () => <DataProviderScope provider={cities}>
    {/* the whole popup, in place of Map.Popup.Renderer */}
    <LeafletMap fieldMapping={FIELD_MAPPING} height='480px' components={{ marker: { popup: { onRender: () => <Postcard /> } } }} />
</DataProviderScope>
`

export const PostcardExample = () => run(POSTCARD_CODE, citiesFile('country', 'population', 'euSince', 'region'))

const BOARDING_PASS_CODE = `import { DataProviderScope, IMapPoint, LeafletMap, useMap, useMapRecord, useMapRecords, useTheme } from '@talxis/base-controls'
import { FontWeights, Icon, ITheme, mergeStyleSets, Stack, Text } from '@fluentui/react'
import { cities, FIELD_MAPPING } from './data'

const HOME = 'Prague'
const CRUISE_SPEED_KMH = 800
const TAXI_AND_CLIMB_MINUTES = 30

//nothing here comes from the map: the whole popup is yours
const getStyles = (theme: ITheme, color: string) => mergeStyleSets({
    pass: { width: 240, fontFamily: theme.fonts.medium.fontFamily },
    band: { padding: '8px 12px', color: '#ffffff', background: color, fontWeight: FontWeights.semibold, letterSpacing: 2, textTransform: 'uppercase' },
    route: { padding: 12 },
    code: { fontSize: 28, fontWeight: FontWeights.bold },
    facts: { padding: '0 12px 12px', color: theme.semanticColors.bodySubtext },
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

const BoardingPass = () => {
    //the docs' theme, so the pass turns dark with the map
    const theme = useTheme()
    const map = useMap()
    const capital = useMapRecord()
    const home = useMapRecords().find(record => record.getValue('name') === HOME)!
    const regions = map.services.get('provider').getColumnsMap().region.metadata?.OptionSet ?? []
    const color = regions.find(region => region.Value === Number(capital.getValue('region')))?.Color ?? theme.palette.themePrimary
    const styles = getStyles(theme, color)
    const kilometres = Math.round(getDistance(map.getPoint(home)!, map.getPoint(capital)!))
    const minutes = Math.round(kilometres / CRUISE_SPEED_KMH * 60) + TAXI_AND_CLIMB_MINUTES

    return <div className={styles.pass}>
        <div className={styles.band}>Boarding pass</div>
        <Stack horizontal horizontalAlign='space-between' verticalAlign='center' className={styles.route}>
            <Text className={styles.code}>{toCode(HOME)}</Text>
            <Icon iconName='Airplane' />
            <Text className={styles.code}>{toCode(capital.getFormattedValue('name'))}</Text>
        </Stack>
        <Text block className={styles.facts}>{kilometres.toLocaleString()} km, {Math.floor(minutes / 60)}h {minutes % 60}m</Text>
    </div>
}

const GridExample = () => <DataProviderScope provider={cities}>
    {/* the whole popup, in place of Map.Popup.Renderer */}
    <LeafletMap fieldMapping={FIELD_MAPPING} height='480px' components={{ marker: { popup: { onRender: () => <BoardingPass /> } } }} />
</DataProviderScope>
`

export const BoardingPassExample = () => run(BOARDING_PASS_CODE, citiesFile('region'))

const TRIP_FIELDS: CapitalField[] = ['country', 'population', 'status']

const TRIP_DATA_FILE: IGridExampleFile = {
    name: 'data.ts',
    code: `import { DataTypes, MemoryDataProvider } from '@talxis/client-libraries'

//the columns a pin's position is read from
export const FIELD_MAPPING = { latitude: 'lat', longitude: 'lng' }

export const WISHLIST = 1
export const VISITED = 2

//an option set: each option's colour is the colour of its tag
const STATUSES = [
    { Value: WISHLIST, Label: 'Wishlist', Color: '#0078d4' },
    { Value: VISITED, Label: 'Visited', Color: '#107c10' },
]

export const COLUMNS = [
${formatColumns(TRIP_FIELDS).map(column => `    ${column},`).join('\n')}
]

//the capitals of the EU, with latitude and longitude in decimal degrees
const CAPITALS = [
${formatCapitals(TRIP_FIELDS)}
]

//every provider shares the rows, so a saved change outlives a remount
export const createCitiesProvider = () => new MemoryDataProvider({
    dataSource: CAPITALS,
    metadata: { PrimaryIdAttribute: 'name', PrimaryNameAttribute: 'name', LogicalName: 'capital', QuickFindColumns: ['name', 'country'] },
    columns: COLUMNS,
})
`,
}

const TRIP_CODE = `import { DatasetControl, IRibbonCommand, LeafletMap, Map, useDataProvider, useDatasetControl, useEventEmitter } from '@talxis/base-controls'
import type { IDataProviderEventListeners } from '@talxis/client-libraries'
import { FIELD_MAPPING, VISITED } from './data'
import { loadTrip } from './views'
import { COMPONENTS } from './CityCard'

//covers the control with its loading overlay while the provider loads, such as for a quick find
const LoadingCover = () => {
    const overlay = useDatasetControl().parts.get('loadingOverlay')
    const hide = React.useRef<() => void>()
    useEventEmitter<IDataProviderEventListeners>(useDataProvider(), 'onLoading', isLoading => {
        hide.current?.()
        hide.current = isLoading ? overlay.show('Loading map data…') : undefined
    })
    return null
}

//DatasetControl.Ribbon calls onLoad again on every selection, such as one made in a popup
const TripRibbon = () => {
    const provider = useDataProvider()

    const onLoad = (): IRibbonCommand[] => {
        const capitals = provider.getSelectedRecordIds().map(id => provider.getRecordsMap()[id])
        if (capitals.length === 0) {
            return []
        }
        const markVisited = async () => {
            capitals.forEach(capital => capital.setValue('status', VISITED))
            //saved at once, so it leaves no unsaved changes behind
            await provider.save(capitals)
        }
        return [{ id: 'markVisited', label: \`Mark \${capitals.length} as visited\`, iconName: 'CheckMark', onExecute: markVisited }]
    }

    return <DatasetControl.Ribbon onLoad={onLoad} />
}

//a map in place of the table while the control loads
const GridExample = () => <DatasetControl onLoad={loadTrip} height='560px' components={{ skeleton: { onRenderSkeleton: props => <Map.Ui.Skeleton {...props} /> } }}>
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
        <LeafletMap fieldMapping={FIELD_MAPPING} components={COMPONENTS}>
            <LoadingCover />
        </LeafletMap>
    </DatasetControl.Body>
</DatasetControl>
`

const TRIP_VIEWS_FILE: IGridExampleFile = {
    name: 'views.ts',
    code: `import { IDatasetControlLoadResult, IDatasetControlView } from '@talxis/base-controls'
import { IDataProvider, Operators, Type } from '@talxis/client-libraries'
import { COLUMNS, createCitiesProvider, VISITED, WISHLIST } from './data'

const getColumn = (name: string) => COLUMNS.find(column => column.name === name)!
//loaded for the pins and the popup's header, never shown
const READ_BY_THE_MAP = ['lat', 'lng', 'status'].map(name => ({ ...getColumn(name), isHidden: true }))
const columns = [getColumn('name'), getColumn('country'), ...READ_BY_THE_MAP]

const filterByStatus = (provider: IDataProvider, status: number) => {
    provider.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'status', conditionOperator: Operators.Equal.Value, value: String(status) }] })
    return { columns }
}

const VIEWS: IDatasetControlView[] = [
    { id: 'all', name: 'All capitals', resolve: () => ({ columns }) },
    { id: 'wishlist', name: 'Wishlist', resolve: provider => filterByStatus(provider, WISHLIST) },
    { id: 'visited', name: 'Visited', resolve: provider => filterByStatus(provider, VISITED) },
]

export const loadTrip = async (): Promise<IDatasetControlLoadResult> => {
    const provider = createCitiesProvider()
    //a second per load, like a server, so the control's overlay shows over the map
    const getDataAsync = provider.getDataAsync.bind(provider)
    provider.getDataAsync = async (...args: Parameters<typeof getDataAsync>) => {
        await new Promise(resolve => setTimeout(resolve, 1000))
        return getDataAsync(...args)
    }
    //what Edit columns offers: a memory provider lists the columns of its saved queries
    provider.setMetadata({ ...provider.getMetadata(), SavedQueries: [{ columns: ['name', 'country', 'population'].map(getColumn) }] })
    return { provider, views: VIEWS }
}
`,
}

const CITY_CARD_FILE: IGridExampleFile = {
    name: 'CityCard.tsx',
    code: `import { ILeafletComponents, IMapUiMarkerPinProps, Map, useDataProviderEvents, useMapRecord } from '@talxis/base-controls'
import { Link } from '@fluentui/react'

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
    const color = isSelected ? '#323130' : statuses.find(status => status.Value === Number(record.getValue('status')))?.Color
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
        <Link onClick={toggle}>{isSelected ? 'Deselect' : 'Select'}</Link>
    </Map.Popup.Card>
}

export const COMPONENTS: ILeafletComponents = {
    marker: {
        pin: { onRenderPin: props => <CityPin {...props} /> },
        popup: { onRender: () => <CityCard /> },
    },
}
`,
}

export const TripPlannerExample = () => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code: TRIP_CODE }, TRIP_VIEWS_FILE, CITY_CARD_FILE, TRIP_DATA_FILE]} tabs={['preview', 'code']} />
