import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { DEAL_LIST_TABS } from '../dealListFiles'

const FIRST_DEAL_LIST_CODE = `import { ClientSideGrid, DatasetControl, IDatasetControlLoadResult } from '@talxis/base-controls'
import { IMemoryProviderEntityMetadata, MemoryDataProvider } from '@talxis/client-libraries'

//the docs dataset's deals, kept outside onLoad
const deals = DEAL_ROWS.map(row => ({ ...row }))

//a deal's id and name columns, its entity, and the columns a search looks in
const metadata: IMemoryProviderEntityMetadata = { PrimaryIdAttribute: DEAL_PRIMARY_ID, PrimaryNameAttribute: 'name', LogicalName: 'docs_deal', QuickFindColumns: ['name'] }

//called on every load for the provider the parts work on
const loadDeals = async (): Promise<IDatasetControlLoadResult> => ({
    provider: new MemoryDataProvider({ dataSource: deals, metadata, columns: DEAL_COLUMNS }),
})

//the control loads the deals for the grid in its body
const GridExample = () => <DatasetControl onLoad={loadDeals} height='480px'>
    <DatasetControl.Body>
        {/* draws the control's provider */}
        <ClientSideGrid />
    </DatasetControl.Body>
</DatasetControl>
`

export const YourFirstDealListExample = () => <GridExampleRunner seedCode={FIRST_DEAL_LIST_CODE} tabs={DEAL_LIST_TABS} />
