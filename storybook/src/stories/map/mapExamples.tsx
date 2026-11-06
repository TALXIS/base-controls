import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { createLeafletMapProvider } from './LeafletMapProvider'

const MAP_CODE = `import { IMapProvider, Map, usePcfContext } from '@talxis/base-controls'
import { Dataset, DataTypes, MemoryDataProvider } from '@talxis/client-libraries'
import { mergeStyleSets } from '@fluentui/react'
import { CITIES } from './data'

//the columns a pin's position is read from
const PIN_METADATA = { LatitudeAttributeName: 'lat', LongitudeAttributeName: 'lng' }

const styles = mergeStyleSets({
    map: { height: 420 },
})

const createCities = () => {
    const dataset = new Dataset(new MemoryDataProvider({
        dataSource: CITIES,
        metadata: { PrimaryIdAttribute: 'name', PrimaryNameAttribute: 'name', LogicalName: 'city' },
        columns: [
            { name: 'name', displayName: 'City', dataType: DataTypes.SingleLineText },
            { name: 'lat', displayName: 'Latitude', dataType: DataTypes.Decimal },
            { name: 'lng', displayName: 'Longitude', dataType: DataTypes.Decimal },
        ],
    }))
    //the map draws its pins when the records load
    dataset.refresh()
    return dataset
}

//mapProvider draws the map: createGoogleMapsProvider({ apiKey }), or a component of your own
const GridExample = (props: { mapProvider: IMapProvider }) => {
    const context = usePcfContext()
    const dataset = React.useMemo(createCities, [])

    return <div className={styles.map}>
        <Map context={context} parameters={{ Dataset: dataset, PinMetadata: PIN_METADATA, MapProvider: props.mapProvider }} />
    </div>
}
`

const CITIES_FILE: IGridExampleFile = {
    name: 'data.ts',
    code: `//latitude and longitude in decimal degrees
export const CITIES = [
    { name: 'Prague', lat: 50.0755, lng: 14.4378 },
    { name: 'Brno', lat: 49.1951, lng: 16.6068 },
    { name: 'Warsaw', lat: 52.2297, lng: 21.0122 },
    { name: 'Sarajevo', lat: 43.8563, lng: 18.4131 },
]
`,
}

//draws with Leaflet and OpenStreetMap, which need no key
const MAP_PROVIDER = createLeafletMapProvider()

export const MapExample = () => <GridExampleRunner seedCode={[{ name: 'GridExample.tsx', code: MAP_CODE }, CITIES_FILE]} previewProps={{ mapProvider: MAP_PROVIDER }} tabs={['preview', 'code']} />
