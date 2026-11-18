import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { DEAL_LIST_TABS, DEALS_RIBBON_FILE, withDealList } from '../dealListFiles'

const MESSAGES_CODE = `import { ClientSideGrid, createEditingModule, createRowSelectionModule, DatasetControl, useDataProvider } from '@talxis/base-controls'
import { DefaultButton } from '@fluentui/react'
import { loadDeals } from './deals'
import { DealsRibbon } from './DealsRibbon'

//new: stands in for the deals service failing a later load
const BreakTheConnection = () => {
    const provider = useDataProvider()
    return <DefaultButton text='Break the connection' onClick={() => provider.setError(true, 'The deals service is not reachable.')} />
}

const GridExample = () => <DatasetControl onLoad={loadDeals} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
            {/* new: its error shows in the notifications */}
            <BreakTheConnection />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <DealsRibbon />
            <DatasetControl.EditColumns />
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    {/* new: your messages, and the provider's error */}
    <DatasetControl.Notifications messages={[{ text: 'Deals are synced from the CRM every night.', level: 'INFO' }]} />
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

const LIST_OF_YOUR_OWN_CODE = `import { DatasetControl, useDataProviderEvents } from '@talxis/base-controls'
import { Text } from '@fluentui/react'
import { loadDeals } from './deals'

//redrawn whenever a page loads
const DealNames = () => {
    const provider = useDataProviderEvents(['onNewDataLoaded'])
    return <div style={{ height: '100%', overflow: 'auto' }}>
        {provider.getRecords().map(deal => <Text key={deal.getRecordId()} block>{deal.getFormattedValue('name')}</Text>)}
    </div>
}

const GridExample = () => <DatasetControl onLoad={loadDeals} height='420px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        {/* No records found. takes the list's place while there are no deals */}
        <DatasetControl.EmptyState>
            <DealNames />
        </DatasetControl.EmptyState>
    </DatasetControl.Body>
</DatasetControl>
`

export const MessagesExample = () => <GridExampleRunner seedCode={withDealList(MESSAGES_CODE, DEALS_RIBBON_FILE)} tabs={DEAL_LIST_TABS} />

//the Data tab shows only a grid's provider
export const ListOfYourOwnExample = () => <GridExampleRunner seedCode={withDealList(LIST_OF_YOUR_OWN_CODE)} tabs={['preview', 'code']} />
