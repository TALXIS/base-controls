import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'

const FIRST_APP_CODE = `import { AppThemeProvider, createClientSideRowModelModule, DatasetControl, Grid, PcfContextProvider, StateProvider } from '@talxis/base-controls'
import { DataTypes, MemoryDataProvider } from '@talxis/client-libraries'

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

const GridExample = () => <PcfContextProvider>
    <StateProvider>
        <AppThemeProvider>
            <DatasetControl onLoad={loadProducts} height='240px'>
                <DatasetControl.Body>
                    <Grid modules={[createClientSideRowModelModule()]} />
                </DatasetControl.Body>
            </DatasetControl>
        </AppThemeProvider>
    </StateProvider>
</PcfContextProvider>
`

export const FirstAppExample = () => <GridExampleRunner seedCode={FIRST_APP_CODE} />
