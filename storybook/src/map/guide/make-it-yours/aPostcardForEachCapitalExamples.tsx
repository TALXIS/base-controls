import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { CAPITAL_TABS, citiesFile, REGION_PIN_FILE, withCapitals } from '../capitalTripFiles'

const A_POSTCARD_FOR_EACH_CAPITAL_CODE = `import { DataProviderScope, LeafletMap, Map, RecordCardFieldRow, RecordCardProgress, useMapRecord, useMapRecords } from '@talxis/base-controls'
import { cities, FIELD_MAPPING } from './data'
import { REGION_PINS } from './RegionPin'

//new: drawn in each pin's popup, where the hooks and Map.Popup's parts read the pin's record
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
    <LeafletMap fieldMapping={FIELD_MAPPING} height='480px' components={{
        marker: {
            pin: REGION_PINS,
            //new: the whole popup, in place of Map.Popup.Renderer
            popup: { onRender: () => <Postcard /> },
        },
    }} />
</DataProviderScope>
`

export const APostcardForEachCapitalExample = () => <GridExampleRunner seedCode={withCapitals(A_POSTCARD_FOR_EACH_CAPITAL_CODE, citiesFile(['country', 'population', 'euSince', 'region']), REGION_PIN_FILE)} tabs={CAPITAL_TABS} />
