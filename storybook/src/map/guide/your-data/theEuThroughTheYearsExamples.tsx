import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { CAPITAL_TABS, citiesFile, POSTCARD_FILE, REGION_PIN_FILE, withCapitals } from '../capitalTripFiles'

const THE_EU_THROUGH_THE_YEARS_CODE = `import { DataProviderScope, LeafletMap, useMapRecords } from '@talxis/base-controls'
import { Operators, Type } from '@talxis/client-libraries'
import { Slider, Text } from '@fluentui/react'
import { cities, FIELD_MAPPING } from './data'
import { REGION_PINS } from './RegionPin'
import { Postcard } from './Postcard'

//new: a child of the map, drawn again each time the provider loads new data
const MemberCount = () => <Text>{useMapRecords().length} member states</Text>

//new: the pins are the provider's records, so filtering the provider filters the pins
const onYearChange = (year: number) => {
    cities.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'euSince', conditionOperator: Operators.LessThanOrEqual.Value, value: String(year) }] })
    cities.refresh()
}

const GridExample = () => <>
    {/* new: the year the map shows */}
    <Slider label='The EU in' min={1958} max={2013} defaultValue={2013} onChange={onYearChange} />
    <DataProviderScope provider={cities}>
        <LeafletMap fieldMapping={FIELD_MAPPING} height='480px' components={{ marker: { pin: REGION_PINS, popup: { onRender: () => <Postcard /> } } }}>
            {/* new: drawn in the map's box, under the map */}
            <MemberCount />
        </LeafletMap>
    </DataProviderScope>
</>
`

export const TheEuThroughTheYearsExample = () => <GridExampleRunner seedCode={withCapitals(THE_EU_THROUGH_THE_YEARS_CODE, citiesFile(['country', 'population', 'euSince', 'region']), REGION_PIN_FILE, POSTCARD_FILE)} tabs={CAPITAL_TABS} />
