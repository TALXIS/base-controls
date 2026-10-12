import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { RIBBON_FILE, VIEWS_FILE, withFiles } from './shared'

const VIEWS_CODE = `import { loadDeals } from './views'

const GridExample = () => <DatasetControl stateKey='deals' onLoad={loadDeals} height='440px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <Grid stateKey='grid' modules={{ rowModel: createClientSideRowModelModule(), editing: createEditingModule({ autoSave: false }) }} />
    </DatasetControl.Body>
</DatasetControl>
`

const RIBBON_CODE = `import { DealsRibbon } from './DealsRibbon'

const GridExample = () => <DatasetControl stateKey='deals' onLoad={async () => ({ provider: createDealsProvider() })} height='440px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DealsRibbon />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <Grid stateKey='grid' modules={{ rowModel: createClientSideRowModelModule(), rowSelection: createRowSelectionModule({ mode: 'multiple' }) }} />
    </DatasetControl.Body>
</DatasetControl>
`

const QUICK_FIND_CODE = `//the deal name is what the quick find searches
const loadSearchableDeals = async () => {
    const provider = createDealsProvider()
    provider.setColumns(provider.getColumns().map(column => ({ ...column, isPrimary: column.name === 'name' })))
    return { provider }
}

const GridExample = () => <DatasetControl stateKey='deals' onLoad={loadSearchableDeals} height='440px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <Grid stateKey='grid' modules={{ rowModel: createClientSideRowModelModule() }} />
    </DatasetControl.Body>
</DatasetControl>
`

const EDIT_COLUMNS_CODE = `import { loadDeals } from './views'

const GridExample = () => <DatasetControl stateKey='deals' onLoad={loadDeals} height='440px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <DatasetControl.EditColumns enableScopeSelector={false} />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <Grid stateKey='grid' modules={{ rowModel: createClientSideRowModelModule() }} />
    </DatasetControl.Body>
</DatasetControl>
`

const NOTIFICATIONS_CODE = `//stands in for the provider failing to load its next page
const BreakTheConnection = () => {
    const provider = useDataProvider()
    return <DefaultButton text='Break the connection' onClick={() => provider.setError(true, 'The deals service is not reachable.')} />
}

const GridExample = () => <DatasetControl stateKey='deals' onLoad={async () => ({ provider: createDealsProvider() })} height='440px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <BreakTheConnection />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Notifications messages={[{ text: 'Deals are synced from the CRM every night.', level: 'INFO' }]} />
    <DatasetControl.Body>
        <Grid stateKey='grid' modules={{ rowModel: createClientSideRowModelModule() }} />
    </DatasetControl.Body>
</DatasetControl>
`

const EMPTY_RECORDS_CODE = `//the deals' names, drawn again whenever the provider loads new records
const DealNames = () => {
    const provider = useDataProvider()
    const [, setVersion] = React.useState(0)
    React.useEffect(() => {
        const rerender = () => setVersion(version => version + 1)
        provider.addEventListener('onNewDataLoaded', rerender)
        return () => provider.removeEventListener('onNewDataLoaded', rerender)
    }, [provider])
    return <Stack tokens={{ childrenGap: 4, padding: 12 }}>
        {provider.getRecords().map(record => <Text key={record.getRecordId()}>{record.getFormattedValue('name')}</Text>)}
    </Stack>
}

const GridExample = () => <DatasetControl stateKey='deals' onLoad={async () => ({ provider: createDealsProvider() })} height='360px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <DatasetControl.EmptyRecords>
            <DealNames />
        </DatasetControl.EmptyRecords>
    </DatasetControl.Body>
</DatasetControl>
`

const PAGING_CODE = `const GridExample = () => <DatasetControl stateKey='deals' onLoad={async () => ({ provider: createDealsProvider() })} height='440px'>
    <DatasetControl.Body>
        <Grid stateKey='grid' modules={{ rowModel: createClientSideRowModelModule() }} />
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

export const ViewsExample = () => <GridExampleRunner seedCode={withFiles(VIEWS_CODE, VIEWS_FILE)} />
export const RibbonExample = () => <GridExampleRunner seedCode={withFiles(RIBBON_CODE, RIBBON_FILE)} />
export const QuickFindExample = () => <GridExampleRunner seedCode={QUICK_FIND_CODE} />
export const EditColumnsExample = () => <GridExampleRunner seedCode={withFiles(EDIT_COLUMNS_CODE, VIEWS_FILE)} />
export const NotificationsExample = () => <GridExampleRunner seedCode={NOTIFICATIONS_CODE} />
export const EmptyRecordsExample = () => <GridExampleRunner seedCode={EMPTY_RECORDS_CODE} />
export const PagingExample = () => <GridExampleRunner seedCode={PAGING_CODE} />
