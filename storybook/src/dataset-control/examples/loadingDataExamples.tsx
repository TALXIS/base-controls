import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { VIEWS_FILE, withFiles } from './shared'

const WAITING_CODE = `import { loadDeals, loadDealViews } from './views'

//the title is outside the control, so it shows while the deals load
const GridExample = () => <Stack tokens={{ childrenGap: 8 }}>
    <Text variant='large'>Sales pipeline</Text>
    <DatasetControl onLoadViews={loadDealViews} stateKey='deals' onLoad={loadDeals} height='420px'>
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

export const WaitingExample = () => <GridExampleRunner seedCode={withFiles(WAITING_CODE, VIEWS_FILE)} />
