import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { CAPITAL_TABS, citiesFile, withCapitals } from '../capitalTripFiles'

const MAKE_IT_FIT_CODE = `import { DataProviderScope, LeafletMap } from '@talxis/base-controls'
import { Slider } from '@fluentui/react'
import { cities, FIELD_MAPPING } from './data'

const GridExample = () => {
    //new: the panel's height, which the page decides
    const [panelHeight, setPanelHeight] = React.useState(440)

    return <>
        {/* new: sets the panel's height */}
        <Slider label='Panel height' min={220} max={700} step={20} value={panelHeight} onChange={setPanelHeight} valueFormat={value => value + 'px'} />
        {/* new: a flex column with a height */}
        <div style={{ display: 'flex', flexDirection: 'column', height: panelHeight }}>
            <DataProviderScope provider={cities}>
                {/* new: no height, so the map fills the panel */}
                <LeafletMap fieldMapping={FIELD_MAPPING} />
            </DataProviderScope>
        </div>
    </>
}
`

export const MakeItFitExample = () => <GridExampleRunner seedCode={withCapitals(MAKE_IT_FIT_CODE, citiesFile())} tabs={CAPITAL_TABS} />
