import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { CAPITAL_TABS, citiesFile, withCapitals } from '../capitalTripFiles'

const PICK_THE_TILES_CODE = `import { DataProviderScope, GoogleMap, LeafletMap } from '@talxis/base-controls'
import { Dropdown, Pivot, PivotItem, TextField } from '@fluentui/react'
import { cities, FIELD_MAPPING } from './data'

//new: the credit shown with Esri's tiles
const ESRI = 'Tiles &copy; <a href="https://www.esri.com">Esri</a>'

//new: each tile service's URL template and credit
const TILES = [
    { key: 'openStreetMap', text: 'OpenStreetMap' },
    { key: 'lightGray', text: 'Esri Light Gray', tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', attribution: ESRI },
    { key: 'darkGray', text: 'Esri Dark Gray', tileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', attribution: ESRI },
]

const GridExample = () => {
    //new: the tiles picked and the key pasted
    const [tiles, setTiles] = React.useState(TILES[0])
    const [apiKey, setApiKey] = React.useState('')

    return <DataProviderScope provider={cities}>
        {/* new: a tab for each map library */}
        <Pivot>
            <PivotItem headerText='Leaflet'>
                <Dropdown label='Leaflet tiles' options={TILES} selectedKey={tiles.key} onChange={(_, option) => setTiles(option as typeof tiles)} />
                {/* new: new tiles mount the map again */}
                <LeafletMap fieldMapping={FIELD_MAPPING} tileUrl={tiles.tileUrl} attribution={tiles.attribution} height='440px' />
            </PivotItem>
            <PivotItem headerText='Google Maps'>
                {/* new: the Maps API loads once per page, under the first key it gets */}
                <TextField label='Google Maps API key' placeholder='Paste a key, then press Enter' type='password' canRevealPassword onKeyDown={event => event.key === 'Enter' && setApiKey(event.currentTarget.value)} />
                {apiKey && <GoogleMap fieldMapping={FIELD_MAPPING} apiKey={apiKey} height='440px' />}
            </PivotItem>
        </Pivot>
    </DataProviderScope>
}
`

export const PickTheTilesExample = () => <GridExampleRunner seedCode={withCapitals(PICK_THE_TILES_CODE, citiesFile())} tabs={CAPITAL_TABS} />
