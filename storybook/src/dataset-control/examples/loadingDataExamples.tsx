import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { VIEWS_FILE, withFiles } from './shared'

const WAITING_CODE = `import { loadDeals } from './views'

//the title is outside the control, so it shows while the deals load
const GridExample = () => <Stack tokens={{ childrenGap: 8 }}>
    <Text variant='large'>Sales pipeline</Text>
    <DatasetControl stateKey='deals' onLoad={loadDeals} height='420px'>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.ViewSwitcher />
            </DatasetControl.Header.Start>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <Grid stateKey='grid' modules={{ rowModel: createClientSideRowModelModule() }} />
        </DatasetControl.Body>
    </DatasetControl>
</Stack>
`

const FAILED_LOAD_CODE = `import { loadDeals } from './views'

let attempt = 0

//every other attempt fails, so Try again loads the deals
const loadDealsOnRetry = async (params: IDatasetControlLoadParameters) => {
    attempt++
    if (attempt % 2 === 1) {
        await new Promise(resolve => setTimeout(resolve, 600))
        throw Object.assign(new Error('The deals could not be loaded.'), { cause: 'The deals service did not respond within 30 seconds.' })
    }
    return loadDeals(params)
}

const GridExample = () => <DatasetControl stateKey='deals' onLoad={loadDealsOnRetry} height='420px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <Grid stateKey='grid' modules={{ rowModel: createClientSideRowModelModule() }} />
    </DatasetControl.Body>
</DatasetControl>
`

export const WaitingExample = () => <GridExampleRunner seedCode={withFiles(WAITING_CODE, VIEWS_FILE)} />
export const FailedLoadExample = () => <GridExampleRunner seedCode={withFiles(FAILED_LOAD_CODE, VIEWS_FILE)} />
