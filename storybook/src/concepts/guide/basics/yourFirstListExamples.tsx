import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { STORE_OPENINGS_TABS, withStoreOpenings } from '../storeOpeningsFiles'

const YOUR_FIRST_LIST_CODE = `import { AppThemeProvider, ClientSideGrid, DatasetControl, PcfContextProvider } from '@talxis/base-controls'
import { createStoresProvider } from './stores'

//called on every load for the provider the grid draws
const loadStores = async () => ({ provider: createStoresProvider() })

//what the control draws
const Stores = () => <DatasetControl.Body>
    {/* draws each status as a tag in its colour */}
    <ClientSideGrid enableOptionSetColors />
</DatasetControl.Body>

//the control loads the stores for what it draws
const StoreOpenings = () => <DatasetControl onLoad={loadStores} height='520px'>
    <Stores />
</DatasetControl>

//the root providers, once around the whole application
const GridExample = () => <PcfContextProvider>
    <AppThemeProvider>
        <StoreOpenings />
    </AppThemeProvider>
</PcfContextProvider>
`

const YOUR_FIRST_LIST_FILES = withStoreOpenings(YOUR_FIRST_LIST_CODE)

export const YourFirstListExample = () => <GridExampleRunner seedCode={YOUR_FIRST_LIST_FILES} tabs={STORE_OPENINGS_TABS} />
