import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { DEAL_LIST_TABS, withDealList } from '../dealListFiles'

const SEARCH_AND_PAGE_CODE = `import { ClientSideGrid, DatasetControl } from '@talxis/base-controls'
import { loadDeals } from './deals'

const GridExample = () => <DatasetControl onLoad={loadDeals} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
        {/* new: searches the columns the provider names */}
        <DatasetControl.Header.End>
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <ClientSideGrid />
    </DatasetControl.Body>
    {/* new: paging below the records */}
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

export const SearchAndPageExample = () => <GridExampleRunner seedCode={withDealList(SEARCH_AND_PAGE_CODE)} tabs={DEAL_LIST_TABS} />
