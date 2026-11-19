import React from 'react'
import { GridExampleRunner } from '../../GridExampleRunner'
import { CHECKED_DEALS_FILE, DEAL_LIST_TABS, withDealGrid } from '../dealGridFiles'

const CHECK_WHAT_USERS_ENTER_CODE = `import { ClientSideGrid, createEditingModule, DatasetControl } from '@talxis/base-controls'
import { loadDeals } from './deals'

const GridExample = () => <DatasetControl onLoad={loadDeals} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <DatasetControl.Ribbon enableSave enableDiscard />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createEditingModule()]} />
    </DatasetControl.Body>
</DatasetControl>
`

export const CheckWhatUsersEnterExample = () => <GridExampleRunner seedCode={withDealGrid(CHECK_WHAT_USERS_ENTER_CODE, CHECKED_DEALS_FILE)} tabs={DEAL_LIST_TABS} />
