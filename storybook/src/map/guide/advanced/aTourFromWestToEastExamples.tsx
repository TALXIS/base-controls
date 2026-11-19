import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { CAPITAL_TABS, citiesFile, POSTCARD_FILE, REGION_PIN_FILE, withCapitals } from '../capitalTripFiles'

const A_TOUR_FROM_WEST_TO_EAST_CODE = `import { DataProviderScope, ILeaflet, LeafletMap, useMap, useMapModule, useMapRecords } from '@talxis/base-controls'
import { DefaultButton, PrimaryButton, Stack } from '@fluentui/react'
import { cities, FIELD_MAPPING } from './data'
import { REGION_PINS } from './RegionPin'
import { Postcard } from './Postcard'

//new: two buttons under the map that move the map's view
const Tour = () => {
    const map = useMap()
    //the library module, here Leaflet's
    const leaflet = useMapModule('library') as ILeaflet
    const stops = useMapRecords().sort((a, b) => map.getPoint(a)!.longitude - map.getPoint(b)!.longitude)
    const stop = React.useRef(-1)

    //Leaflet's own map flies to the next capital to the east
    const next = () => {
        stop.current = (stop.current + 1) % stops.length
        const { latitude, longitude } = map.getPoint(stops[stop.current])!
        leaflet.getInstance()?.flyTo([latitude, longitude], 11)
    }

    //the viewport moves the map's view to fit every pin
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
    <LeafletMap fieldMapping={FIELD_MAPPING} height='480px' components={{ marker: { pin: REGION_PINS, popup: { onRender: () => <Postcard /> } } }}>
        {/* new: drawn under the map, where useMap() reaches it */}
        <Tour />
    </LeafletMap>
</DataProviderScope>
`

export const ATourFromWestToEastExample = () => <GridExampleRunner seedCode={withCapitals(A_TOUR_FROM_WEST_TO_EAST_CODE, citiesFile(['country', 'population', 'euSince', 'region']), REGION_PIN_FILE, POSTCARD_FILE)} tabs={CAPITAL_TABS} />
