import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { DEAL_LIST_TABS, DEALS_RIBBON_FILE, USER_VIEW_TYPES_FILE, USER_VIEWS_FILE, withDealList } from './dealListFiles'

const DEAL_LIST_CODE = `import { ClientSideGrid, createEditingModule, createGroupingModule, createRowSelectionModule, createSortingModule, DatasetControl, useDataProviderEvents } from '@talxis/base-controls'
import { Text } from '@fluentui/react'
import { loadDeals } from './deals'
import { DealsRibbon } from './DealsRibbon'
import { dealViews, saveDealViewData } from './userViews'

//a part of your own: the total value of the ticked deals
const SelectedValue = () => {
    const provider = useDataProviderEvents(['onRecordsSelected'])
    const total = provider.getSelectedRecordIds().reduce((sum, id) => sum + Number(provider.getRecordsMap()[id].getValue('value')), 0)
    return <Text>Selected: {total.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</Text>
}

//every part inside works on the provider loadDeals returns
const GridExample = () => <DatasetControl modules={[dealViews]} onLoad={loadDeals} onSetup={saveDealViewData} stateKey='overview.deals' height='560px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher>
                <DatasetControl.UserQueries />
            </DatasetControl.ViewSwitcher>
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <DealsRibbon />
            <DatasetControl.EditColumns />
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Notifications messages={[{ text: 'Deals are synced from the CRM every night.', level: 'INFO' }]} />
    <DatasetControl.Body>
        <ClientSideGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createEditingModule(), createSortingModule(), createGroupingModule()]} />
    </DatasetControl.Body>
    <DatasetControl.Footer>
        <DatasetControl.Footer.Start>
            <DatasetControl.PageSizeSwitcher />
            <SelectedValue />
        </DatasetControl.Footer.Start>
        <DatasetControl.Footer.End>
            <DatasetControl.Pagination />
        </DatasetControl.Footer.End>
    </DatasetControl.Footer>
</DatasetControl>
`

export const DealListExample = () => <GridExampleRunner seedCode={withDealList(DEAL_LIST_CODE, DEALS_RIBBON_FILE, USER_VIEWS_FILE, USER_VIEW_TYPES_FILE)} tabs={DEAL_LIST_TABS} />
