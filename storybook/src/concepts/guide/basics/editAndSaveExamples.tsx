import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { STORE_OPENINGS_TABS, withStoreOpenings } from '../storeOpeningsFiles'

const EDIT_AND_SAVE_CODE = `import { ClientSideGrid, createAggregationModule, createEditingModule, createFilteringModule, createRowSelectionModule, createSortingModule, DatasetControl } from '@talxis/base-controls'
import { createStoresProvider } from './stores'

const loadStores = async () => ({ provider: createStoresProvider() })

const Stores = () => <>
    {/* new: Save and Discard changes, shown while a store has unsaved changes */}
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <DatasetControl.Ribbon enableSave enableDiscard />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        {/* new: one module each to tick, edit, sort, filter and total the stores */}
        <ClientSideGrid
            enableOptionSetColors
            modules={[createRowSelectionModule({ mode: 'multiple' }), createEditingModule(), createSortingModule(), createFilteringModule(), createAggregationModule()]} />
    </DatasetControl.Body>
</>

const StoreOpenings = () => <DatasetControl onLoad={loadStores} height='520px'>
    <Stores />
</DatasetControl>

const GridExample = () => <StoreOpenings />
`

const EDIT_AND_SAVE_FILES = withStoreOpenings(EDIT_AND_SAVE_CODE)

export const EditAndSaveExample = () => <GridExampleRunner seedCode={EDIT_AND_SAVE_FILES} tabs={STORE_OPENINGS_TABS} />
