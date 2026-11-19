import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { CAPITAL_TABS, citiesFile, withCapitals } from '../capitalTripFiles'

const A_LIBRARY_OF_YOUR_OWN_CODE = `import { DataProviderScope, IMapLibrary, IMapModule, IMapPoint, IMapViewRequest, Map, MapRecordContext, useMap, useMapModule, useMapRecord, useMapRecords, useTheme } from '@talxis/base-controls'
import { cities, FIELD_MAPPING } from './data'

//new: the airline's home, where every route starts
const HOME = 'Prague'

//new: the library's own map, an SVG drawn in degrees of longitude and latitude
class RouteMap implements IMapLibrary {
    public svg: SVGSVGElement | null = null

    public getInstance() {
        return this.svg
    }
}

//new: the module Map needs, named library
const routeMapLibrary: IMapModule = { name: 'library', onLoad: () => new RouteMap() }

//new: the viewport's request as a viewBox two degrees clear, north up
const toViewBox = (request: IMapViewRequest) => {
    const { north, south, east, west } = 'bounds' in request
        ? request.bounds
        : { north: request.center.latitude, south: request.center.latitude, east: request.center.longitude, west: request.center.longitude }
    return \`\${west - 2} \${-north - 2} \${east - west + 4} \${north - south + 4}\`
}

//new: one capital and its route from home, read through the pin's record
const Stop = (props: { home: IMapPoint }) => {
    const capital = useMapRecord()
    const { latitude, longitude } = useMap().getPoint(capital)!
    return <g>
        <line x1={props.home.longitude} y1={-props.home.latitude} x2={longitude} y2={-latitude} stroke='currentColor' strokeWidth={0.05} />
        <circle cx={longitude} cy={-latitude} r={0.3} fill='currentColor'>
            <title>{capital.getFormattedValue('name')}</title>
        </circle>
    </g>
}

//new: draws the library's map, as LeafletMap draws Leaflet's
const RouteMapView = () => {
    const map = useMap()
    const routeMap = useMapModule('library') as RouteMap
    const capitals = useMapRecords()
    const theme = useTheme()
    const [viewBox, setViewBox] = React.useState<string>()
    React.useEffect(() => {
        const viewport = map.services.get('viewport')
        const stopListening = viewport.events.addEventListener('onViewRequested', request => setViewBox(toViewBox(request)))
        //the first view, now that the map is drawn
        viewport.fit()
        return stopListening
    }, [])
    const home = map.getPoint(capitals.find(capital => capital.getValue('name') === HOME)!)!

    return <svg ref={svg => { routeMap.svg = svg }} viewBox={viewBox} style={{ flex: 1, color: theme.palette.themePrimary }}>
        {/* each pin inside its record, so useMapRecord() works in it */}
        {capitals.map(capital => <MapRecordContext.Provider key={capital.getRecordId()} value={capital}>
            <Stop home={home} />
        </MapRecordContext.Provider>)}
    </svg>
}

const GridExample = () => <DataProviderScope provider={cities}>
    {/* new: Map itself, with the library module, and its map as a child */}
    <Map fieldMapping={FIELD_MAPPING} modules={[routeMapLibrary]} height='480px'>
        <RouteMapView />
    </Map>
</DataProviderScope>
`

export const ALibraryOfYourOwnExample = () => <GridExampleRunner seedCode={withCapitals(A_LIBRARY_OF_YOUR_OWN_CODE, citiesFile())} tabs={CAPITAL_TABS} />
