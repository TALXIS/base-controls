import React from 'react'
import { GridExampleRunner } from '../../GridExampleRunner'
import { DEAL_LIST_TABS, FIRST_DEALS_FILE, withDealGrid } from '../dealGridFiles'

const EDIT_AND_SAVE_CODE = `import { ClientSideGrid, createEditingModule, DatasetControl } from '@talxis/base-controls'
import { loadDeals } from './deals'

const GridExample = () => <DatasetControl onLoad={loadDeals} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            {/* new: Save and Discard changes, while there are unsaved changes */}
            <DatasetControl.Ribbon enableSave enableDiscard />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        {/* new: a double-click opens the cell's editor */}
        <ClientSideGrid modules={[createEditingModule()]} />
    </DatasetControl.Body>
</DatasetControl>
`

export const EditAndSaveExample = () => <GridExampleRunner seedCode={withDealGrid(EDIT_AND_SAVE_CODE, FIRST_DEALS_FILE)} tabs={DEAL_LIST_TABS} />
