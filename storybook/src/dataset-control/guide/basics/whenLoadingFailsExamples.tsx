import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { DEAL_LIST_TABS, withDealList } from '../dealListFiles'

const WHEN_LOADING_FAILS_CODE = `import { ClientSideGrid, DatasetControl, IDatasetControlLoadResult } from '@talxis/base-controls'
import { loadDeals } from './deals'

//new: counts every load, the first one included
let attempt = 0

//new: the deals service does not answer on odd attempts
const loadDealsOrFail = async (): Promise<IDatasetControlLoadResult> => {
    attempt++
    if (attempt % 2 === 1) {
        await new Promise(resolve => setTimeout(resolve, 600))
        //new: shown as the title, with the cause under Details
        throw Object.assign(new Error('The deals could not be loaded.'), { cause: 'The deals service did not respond within 30 seconds.' })
    }
    return loadDeals()
}

const GridExample = () => <DatasetControl onLoad={loadDealsOrFail} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <ClientSideGrid />
    </DatasetControl.Body>
</DatasetControl>
`

export const WhenLoadingFailsExample = () => <GridExampleRunner seedCode={withDealList(WHEN_LOADING_FAILS_CODE)} tabs={DEAL_LIST_TABS} />
