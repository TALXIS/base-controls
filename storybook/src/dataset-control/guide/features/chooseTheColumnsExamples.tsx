import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { DEAL_LIST_TABS, DEALS_RIBBON_FILE, withDealList } from '../dealListFiles'

const CHOOSE_THE_COLUMNS_CODE = `import { ClientSideGrid, createEditingModule, createRowSelectionModule, DatasetControl } from '@talxis/base-controls'
import { loadDeals } from './deals'
import { DealsRibbon } from './DealsRibbon'

const GridExample = () => <DatasetControl onLoad={loadDeals} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <DealsRibbon />
            {/* new: opens the column editor for the open view */}
            <DatasetControl.EditColumns />
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createEditingModule()]} />
    </DatasetControl.Body>
    <DatasetControl.Footer>
        <DatasetControl.Footer.Start>
            <DatasetControl.PageSizeSwitcher />
        </DatasetControl.Footer.Start>
        <DatasetControl.Footer.End>
            <DatasetControl.Pagination />
        </DatasetControl.Footer.End>
    </DatasetControl.Footer>
</DatasetControl>
`

export const ChooseTheColumnsExample = () => <GridExampleRunner seedCode={withDealList(CHOOSE_THE_COLUMNS_CODE, DEALS_RIBBON_FILE)} tabs={DEAL_LIST_TABS} />
