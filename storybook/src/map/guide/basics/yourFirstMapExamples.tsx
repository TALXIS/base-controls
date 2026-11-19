import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { CAPITAL_TABS, citiesFile, withCapitals } from '../capitalTripFiles'

const YOUR_FIRST_MAP_CODE = `import { DataProviderScope, LeafletMap } from '@talxis/base-controls'
import { cities, FIELD_MAPPING } from './data'

//the map draws the records of the provider around it
const GridExample = () => <DataProviderScope provider={cities}>
    <LeafletMap fieldMapping={FIELD_MAPPING} height='440px' />
</DataProviderScope>
`

export const YourFirstMapExample = () => <GridExampleRunner seedCode={withCapitals(YOUR_FIRST_MAP_CODE, citiesFile([], { leaveOut: ['Zagreb'] }))} tabs={CAPITAL_TABS} />
