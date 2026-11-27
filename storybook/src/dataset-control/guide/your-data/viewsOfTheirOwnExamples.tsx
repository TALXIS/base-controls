import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { DEAL_LIST_TABS, DEALS_RIBBON_FILE, SYNC_MESSAGE_FILE, USER_VIEW_TYPES_FILE, withDealList } from '../dealListFiles'

const VIEWS_OF_THEIR_OWN_CODE = `import { ClientSideGrid, createEditingModule, createLocalStorageUserQueriesModule, createRowSelectionModule, createSortingModule, DatasetControl, IDatasetControl } from '@talxis/base-controls'
import { loadDeals } from './deals'
import { DealsRibbon } from './DealsRibbon'
import { showSyncMessage } from './syncMessage'

//new: keeps each user's views in this browser
const dealViews = createLocalStorageUserQueriesModule({ storageKey: 'docs.dealList.views' })

//new: saves the sorting, filter and search with every user view
const saveDealViewData = (control: IDatasetControl) => {
    control.modules.observe('userQueries', userQueries => {
        userQueries.saveWithView('sorting', () => control.services.find('provider')?.getSorting(), (sorting, provider) => provider.setSorting(sorting))
        userQueries.saveWithView('filtering', () => control.services.find('provider')?.getFiltering(), (filtering, provider) => provider.setFiltering(filtering))
        userQueries.saveWithView('searchQuery', () => control.services.find('provider')?.getSearchQuery(), (searchQuery, provider) => provider.setSearchQuery(searchQuery))
    })
}

//new: the user queries module, with saveDealViewData run on every load
const GridExample = () => <DatasetControl modules={[dealViews]} onLoad={loadDeals} onSetup={control => { showSyncMessage(control); saveDealViewData(control) }} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher>
                {/* new: the Manage views panel */}
                <DatasetControl.UserQueries />
            </DatasetControl.ViewSwitcher>
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <DealsRibbon />
            <DatasetControl.EditColumns />
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Notifications />
    <DatasetControl.Body>
        {/* new: sorting by a column's header */}
        <ClientSideGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createEditingModule(), createSortingModule()]} />
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

export const ViewsOfTheirOwnExample = () => <GridExampleRunner seedCode={withDealList(VIEWS_OF_THEIR_OWN_CODE, DEALS_RIBBON_FILE, SYNC_MESSAGE_FILE, USER_VIEW_TYPES_FILE)} tabs={DEAL_LIST_TABS} />
