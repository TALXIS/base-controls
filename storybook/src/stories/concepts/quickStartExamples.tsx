import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const FIRST_APP_CODE = `import { AppThemeProvider, ClientSideGrid, DatasetControl, Grid, PcfContextProvider, StateProvider } from '@talxis/base-controls'
import { DataTypes, MemoryDataProvider } from '@talxis/client-libraries'

//a data provider holds the records; this one keeps them in memory
const loadProducts = async () => ({
    provider: new MemoryDataProvider({
        dataSource: [
            { productid: 'desk', name: 'Standing desk', price: 640 },
            { productid: 'chair', name: 'Ergonomic chair', price: 410 },
            { productid: 'lamp', name: 'Desk lamp', price: 85 },
        ],
        metadata: { PrimaryIdAttribute: 'productid', PrimaryNameAttribute: 'name', LogicalName: 'product' },
        columns: [
            { name: 'name', displayName: 'Product', dataType: DataTypes.SingleLineText, isPrimary: true },
            { name: 'price', displayName: 'Price', dataType: DataTypes.Currency },
        ],
    }),
})

//the providers wrap the whole application once
const GridExample = () => <PcfContextProvider>
    <StateProvider>
        <AppThemeProvider>
            {/* the DatasetControl loads the provider, and the Grid inside it draws the records */}
            <DatasetControl onLoad={loadProducts} height='240px'>
                <DatasetControl.Body>
                    <ClientSideGrid />
                </DatasetControl.Body>
            </DatasetControl>
        </AppThemeProvider>
    </StateProvider>
</PcfContextProvider>
`

export const FirstAppExample = () => <GridExampleRunner seedCode={FIRST_APP_CODE} tabs={['preview', 'code']} />
