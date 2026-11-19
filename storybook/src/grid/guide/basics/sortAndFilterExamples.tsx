import React from 'react'
import { GridExampleRunner } from '../../GridExampleRunner'
import { DEAL_LIST_TABS, withDealGrid } from '../dealGridFiles'

const SORT_AND_FILTER_CODE = `import { ClientSideGrid, createEditingModule, createFilteringModule, createSortingModule, DatasetControl } from '@talxis/base-controls'
import { loadDeals } from './deals'

const GridExample = () => <DatasetControl onLoad={loadDeals} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <DatasetControl.Ribbon enableSave enableDiscard />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <ClientSideGrid modules={[
            createEditingModule(),
            //new: sorting and filtering from each column's menu
            createSortingModule(),
            createFilteringModule(),
        ]} />
    </DatasetControl.Body>
</DatasetControl>
`

export const SortAndFilterExample = () => <GridExampleRunner seedCode={withDealGrid(SORT_AND_FILTER_CODE)} tabs={DEAL_LIST_TABS} />
