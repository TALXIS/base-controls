import React from 'react'
import { GridExampleRunner } from '../../GridExampleRunner'
import { DEAL_LIST_TABS, DEALS_RIBBON_FILE, withDealGrid } from '../dealGridFiles'

const SELECT_AND_COPY_CODE = `import { ClientSideGrid, createCellSelectionModule, createClipboardModule, createEditingModule, createFilteringModule, createLicenseModule, createRowSelectionModule, createSortingModule, DatasetControl } from '@talxis/base-controls'
import { loadDeals } from './deals'
import { DealsRibbon } from './DealsRibbon'

//new: your AG Grid Enterprise key, as your host supplies it
const AG_GRID_LICENSE_KEY = ''

const GridExample = () => <DatasetControl onLoad={loadDeals} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            {/* new: the deal list's ribbon, with Mark N as won for the ticked deals */}
            <DealsRibbon />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <ClientSideGrid modules={[
            //new: licenses AG Grid Enterprise, once there is a key
            ...(AG_GRID_LICENSE_KEY ? [createLicenseModule({ key: AG_GRID_LICENSE_KEY })] : []),
            createEditingModule(), createSortingModule(), createFilteringModule(),
            //new: a checkbox on every row
            createRowSelectionModule({ mode: 'multiple' }),
            //new: blocks of cells to highlight and copy
            createCellSelectionModule(),
            createClipboardModule(),
        ]} />
    </DatasetControl.Body>
</DatasetControl>
`

export const SelectAndCopyExample = () => <GridExampleRunner seedCode={withDealGrid(SELECT_AND_COPY_CODE, DEALS_RIBBON_FILE)} tabs={DEAL_LIST_TABS} />
