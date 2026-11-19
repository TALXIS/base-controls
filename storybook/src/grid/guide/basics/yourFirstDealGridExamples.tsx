import React from 'react'
import { GridExampleRunner } from '../../GridExampleRunner'
import { DEAL_LIST_TABS, FIRST_DEALS_FILE, withDealGrid } from '../dealGridFiles'

const YOUR_FIRST_DEAL_GRID_CODE = `import { ClientSideGrid, DatasetControl } from '@talxis/base-controls'
import { loadDeals } from './deals'

//the grid draws the provider of the DatasetControl around it
const GridExample = () => <DatasetControl onLoad={loadDeals} height='480px'>
    <DatasetControl.Body>
        <ClientSideGrid />
    </DatasetControl.Body>
</DatasetControl>
`

const EVERY_DATA_TYPE_CODE = `import { ClientSideGrid, DatasetControl, IDatasetControlLoadResult } from '@talxis/base-controls'
import { deals, DealsProvider, metadata } from './deals'

//all twenty deal columns, each copied
const columns = [...DEAL_COLUMNS, ...DEAL_DETAIL_COLUMNS].map(column => ({ ...column, metadata: { ...column.metadata } }))

const loadEveryColumn = async (): Promise<IDatasetControlLoadResult> => ({ provider: new DealsProvider({ dataSource: deals, metadata, columns }) })

const GridExample = () => <DatasetControl onLoad={loadEveryColumn} height='480px'>
    <DatasetControl.Body>
        <ClientSideGrid />
    </DatasetControl.Body>
</DatasetControl>
`

export const YourFirstDealGridExample = () => <GridExampleRunner seedCode={withDealGrid(YOUR_FIRST_DEAL_GRID_CODE, FIRST_DEALS_FILE)} tabs={DEAL_LIST_TABS} />

export const EveryDataTypeExample = () => <GridExampleRunner seedCode={withDealGrid(EVERY_DATA_TYPE_CODE, FIRST_DEALS_FILE)} tabs={DEAL_LIST_TABS} />
