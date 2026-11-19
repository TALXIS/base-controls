import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { CAPITAL_TABS, citiesFile, withCapitals } from '../capitalTripFiles'

const PINS_COLOURED_BY_REGION_CODE = `import { DataProviderScope, IMapUiMarkerComponents, IMapUiMarkerPinProps, LeafletMap, Map, useMapRecord } from '@talxis/base-controls'
import { Icon } from '@fluentui/react'
import { cities, FIELD_MAPPING, REGIONS } from './data'

//new: the teardrop in the colour of the capital's region
const RegionPin = (props: IMapUiMarkerPinProps) => {
    //the record of the pin being drawn
    const capital = useMapRecord()
    const color = REGIONS.find(region => region.Value === Number(capital.getValue('region')))?.Color
    return <Map.Ui.MarkerPin {...props} color={color} />
}

//new: a star in place of the dot for a capital of two million or more
const CapitalDot = (props: React.HTMLAttributes<HTMLDivElement>) => {
    const isLarge = Number(useMapRecord().getValue('population')) >= 2000000
    //turned back upright inside the turned teardrop
    return isLarge ? <Icon iconName='FavoriteStarFill' style={{ color: 'white', fontSize: 12, transform: 'rotate(45deg)' }} /> : <div {...props} />
}

//new: the pin's slots, for components.marker.pin
const REGION_PINS: Partial<IMapUiMarkerComponents> = {
    onRenderPin: props => <RegionPin {...props} />,
    onRenderDot: props => <CapitalDot {...props} />,
}

const GridExample = () => <DataProviderScope provider={cities}>
    {/* new: each pin drawn through its slots */}
    <LeafletMap fieldMapping={FIELD_MAPPING} height='440px' components={{ marker: { pin: REGION_PINS } }} />
</DataProviderScope>
`

export const PinsColouredByRegionExample = () => <GridExampleRunner seedCode={withCapitals(PINS_COLOURED_BY_REGION_CODE, citiesFile(['population', 'region']))} tabs={CAPITAL_TABS} />
