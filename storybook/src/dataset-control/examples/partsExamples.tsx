import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { RIBBON_FILE, VIEWS_FILE, withFiles } from './shared'

const RIBBON_CODE = `import { DealsRibbon } from './DealsRibbon'

const GridExample = () => <DatasetControl stateKey='ribbonDeals' onLoad={async () => ({ provider: createDealsProvider() })} height='440px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DealsRibbon />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <Grid stateKey='grid' modules={[createClientSideRowModelModule(), createRowSelectionModule({ mode: 'multiple' })]} />
    </DatasetControl.Body>
</DatasetControl>
`

const QUICK_FIND_CODE = `const loadSearchableDeals = async () => {
    const provider = createDealsProvider()
    provider.setMetadata({ ...provider.getMetadata(), QuickFindColumns: ['name', 'owner'] })
    return { provider }
}

const GridExample = () => <DatasetControl stateKey='quickFindDeals' onLoad={loadSearchableDeals} height='440px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <Grid stateKey='grid' modules={[createClientSideRowModelModule()]} />
    </DatasetControl.Body>
</DatasetControl>
`

const EDIT_COLUMNS_CODE = `import { loadDeals, loadDealViews } from './views'

const GridExample = () => <DatasetControl onLoadViews={loadDealViews} stateKey='editColumnsDeals' onLoad={loadDeals} height='440px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <DatasetControl.EditColumns />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <Grid stateKey='grid' modules={[createClientSideRowModelModule()]} />
    </DatasetControl.Body>
</DatasetControl>
`

const NOTIFICATIONS_CODE = `//stands in for the provider failing to load its next page
const BreakTheConnection = () => {
    const provider = useDataProvider()
    return <DefaultButton text='Break the connection' onClick={() => provider.setError(true, 'The deals service is not reachable.')} />
}

const GridExample = () => <DatasetControl stateKey='notificationsDeals' onLoad={async () => ({ provider: createDealsProvider() })} height='440px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <BreakTheConnection />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Notifications messages={[{ text: 'Deals are synced from the CRM every night.', level: 'INFO' }]} />
    <DatasetControl.Body>
        <Grid stateKey='grid' modules={[createClientSideRowModelModule()]} />
    </DatasetControl.Body>
</DatasetControl>
`

const EMPTY_RECORDS_CODE = `const getDealListStyles = (theme: ITheme) => mergeStyleSets({
    list: { height: '100%', overflow: 'auto', padding: '0 12px' },
    row: { padding: '8px 0', borderBottom: \`1px solid \${theme.semanticColors.bodyDivider}\` },
    owner: { color: theme.semanticColors.bodySubtext },
})

const DealList = () => {
    const provider = useDataProviderEvents(['onNewDataLoaded'])
    const theme = useTheme()
    const styles = React.useMemo(() => getDealListStyles(theme), [theme])
    return <div className={styles.list}>
        {provider.getRecords().map(deal => <Stack key={deal.getRecordId()} horizontal horizontalAlign='space-between' className={styles.row}>
            <Stack>
                <Text>{deal.getFormattedValue('name')}</Text>
                <Text variant='small' className={styles.owner}>{deal.getFormattedValue('owner')}</Text>
            </Stack>
            <Text>{deal.getFormattedValue('value')}</Text>
        </Stack>)}
    </div>
}

const loadSearchableDeals = async () => {
    const provider = createDealsProvider()
    provider.setMetadata({ ...provider.getMetadata(), QuickFindColumns: ['name'] })
    return { provider }
}

const GridExample = () => <DatasetControl stateKey='emptyRecordsDeals' onLoad={loadSearchableDeals} height='360px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <DatasetControl.EmptyRecords>
            <DealList />
        </DatasetControl.EmptyRecords>
    </DatasetControl.Body>
</DatasetControl>
`

const PAGING_CODE = `const GridExample = () => <DatasetControl stateKey='pagingDeals' onLoad={async () => ({ provider: createDealsProvider() })} height='440px'>
    <DatasetControl.Body>
        <Grid stateKey='grid' modules={[createClientSideRowModelModule()]} />
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

export const RibbonExample = () => <GridExampleRunner seedCode={withFiles(RIBBON_CODE, RIBBON_FILE)} />
export const QuickFindExample = () => <GridExampleRunner seedCode={QUICK_FIND_CODE} />
export const EditColumnsExample = () => <GridExampleRunner seedCode={withFiles(EDIT_COLUMNS_CODE, VIEWS_FILE)} />
export const NotificationsExample = () => <GridExampleRunner seedCode={NOTIFICATIONS_CODE} />
export const EmptyRecordsExample = () => <GridExampleRunner seedCode={EMPTY_RECORDS_CODE} />
export const PagingExample = () => <GridExampleRunner seedCode={PAGING_CODE} />
