import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { CAPITAL_TABS, citiesFile, REGION_PIN_FILE, withCapitals } from '../capitalTripFiles'

const A_POSTCARD_FOR_EACH_CAPITAL_CODE = `import { DataProviderScope, LeafletMap, Map, Field, useMapRecord, useMapRecords } from '@talxis/base-controls'
import { cities, FIELD_MAPPING } from './data'
import { REGION_PINS } from './RegionPin'

//new: the popup, from Map.Popup's parts and the pin's record
const Postcard = () => {
    const capital = useMapRecord()
    const largest = useMapRecords().reduce((a, b) => Number(a.getValue('population')) >= Number(b.getValue('population')) ? a : b)
    const share = Number(capital.getValue('population')) / Number(largest.getValue('population')) * 100

    return <>
        {/* the region beside the name, as a tag in its option's colour */}
        <Map.Popup.Header statusColumnName='region' />
        <Map.Popup.Body>
            <Map.Popup.FieldList>
                <Map.Popup.Field columnName='country' iconName='Flag' />
                {/* the shared Field parts take any value */}
                <Field.Value label='In the EU since' iconName='Calendar'>{capital.getValue('euSince')}</Field.Value>
                <Field.Progress percent={share} text={\`\${Math.round(share)}% of \${largest.getFormattedValue('name')}\`} />
            </Map.Popup.FieldList>
        </Map.Popup.Body>
    </>
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
