import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const NAME_ONLY_COLUMNS_CODE = `//a view's columns as a user view keeps them: a name and a place
const SAVED_COLUMNS = [{ name: 'name', order: 0 }, { name: 'stage', order: 1 }, { name: 'value', order: 2 }, { name: 'closedate', order: 3 }]

const loadDeals = async () => {
    const provider = new MemoryDataProvider({
        dataSource: DEAL_ROWS.map(row => ({ ...row })),
        metadata: { PrimaryIdAttribute: DEAL_PRIMARY_ID, PrimaryNameAttribute: 'name' },
    })
    //a memory provider takes the columns as they come: no label, no type, no option set
    provider.setColumns(SAVED_COLUMNS as IColumn[])
    return { provider }
}

const GridExample = () => <DatasetControl onLoad={loadDeals} height='360px'>
    <DatasetControl.Body>
        <Grid modules={{ rowModel: createClientSideRowModelModule() }} />
    </DatasetControl.Body>
</DatasetControl>
`

export const NameOnlyColumnsExample = () => <GridExampleRunner seedCode={NAME_ONLY_COLUMNS_CODE} />
