import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { RIBBON_FILE, VIEWS_FILE, withFiles } from './shared'

const RIBBON_CODE = `import { DealsRibbon } from './DealsRibbon'

const NEGOTIATE_STAGE = 3
const WON_STAGE = 4

//a new selection loads the ribbon again, with the commands for it
const selectStage = (control: IDatasetControl, stage: number) => {
    const provider = control.getProvider()!
    provider.setSelectedRecordIds(provider.getRecords().filter(deal => Number(deal.getValue('stage')) === stage).map(deal => deal.getRecordId()))
}

//adds a menu to whatever ribbon the control draws
const addSelectMenu = (control: IDatasetControl) => {
    control.parts.observe('ribbon', ribbon => ribbon.registerCommands(commands => {
        commands.push({ id: 'select', label: 'Select', iconName: 'MultiSelect', commands: [
            { id: 'selectNegotiating', label: 'Deals in negotiation', onExecute: () => selectStage(control, NEGOTIATE_STAGE) },
            { id: 'selectWon', label: 'Won deals', onExecute: () => selectStage(control, WON_STAGE) },
        ] })
    }))
}

const GridExample = () => <DatasetControl stateKey='ribbonDeals' onLoad={async () => ({ provider: createDealsProvider() })} onMounted={addSelectMenu} height='440px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            {/* the built-in commands, each off unless asked for */}
            <DealsRibbon enableSave enableDiscard enableRefresh />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <Grid stateKey='grid' modules={[createClientSideRowModelModule(), createRowSelectionModule({ mode: 'multiple' }), createEditingModule()]} />
    </DatasetControl.Body>
</DatasetControl>
`

const QUICK_FIND_CODE = `const loadSearchableDeals = async () => {
    const provider = createDealsProvider()
    provider.setMetadata({ ...provider.getMetadata(), QuickFindColumns: ['name', 'owner'] })
    return { provider }
}

const GridExample = () => {
    const [draft, setDraft] = React.useState('')

    //follows the query as it is typed, before it is searched
    const onMounted = (control: IDatasetControl) => {
        control.parts.observe('quickFind', quickFind => quickFind.events.addEventListener('onQueryChanged', () => setDraft(quickFind.getQuery())))
    }

    return <Stack tokens={{ childrenGap: 8 }}>
        <DatasetControl stateKey='quickFindDeals' onLoad={loadSearchableDeals} onMounted={onMounted} height='440px'>
            <DatasetControl.Header>
                <DatasetControl.Header.End>
                    <DatasetControl.QuickFind />
                </DatasetControl.Header.End>
            </DatasetControl.Header>
            <DatasetControl.Body>
                <Grid stateKey='grid' modules={[createClientSideRowModelModule()]} />
            </DatasetControl.Body>
        </DatasetControl>
        <Text>Typed: {draft}</Text>
    </Stack>
}
`

const EDIT_COLUMNS_CODE = `import { loadDeals } from './views'

//adds a command above the column pickers
const addCommands = (control: IDatasetControl) => {
    control.parts.observe('editColumns', editColumns => editColumns.registerCommands((commands, session) => {
        const keepOnlyTheDeal = () => session.getColumns().filter(column => column.name !== 'name').forEach(column => session.removeColumn(column.name))
        commands.push({ key: 'keepOnlyTheDeal', text: 'Keep only the deal', iconProps: { iconName: 'ClearFilter' }, onClick: keepOnlyTheDeal })
    }))
}

//opens the column editor from a button of your own
const ColumnsButton = () => {
    const control = useDatasetControl()
    return <DefaultButton text='Columns' iconProps={{ iconName: 'ColumnOptions' }} onClick={() => control.parts.get('editColumns').open()} />
}

const GridExample = () => <DatasetControl stateKey='editColumnsDeals' onLoad={loadDeals} onMounted={addCommands} height='440px'>
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
    <DatasetControl.Footer>
        <DatasetControl.Footer.Start>
            <ColumnsButton />
        </DatasetControl.Footer.Start>
    </DatasetControl.Footer>
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

const EMPTY_STATE_CODE = `const getDealListStyles = (theme: ITheme) => mergeStyleSets({
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

const GridExample = () => <DatasetControl stateKey='emptyStateDeals' onLoad={loadSearchableDeals} height='360px'>
    <DatasetControl.Header>
        <DatasetControl.Header.End>
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <DatasetControl.EmptyState>
            <DealList />
        </DatasetControl.EmptyState>
    </DatasetControl.Body>
</DatasetControl>
`

const PAGING_CODE = `//pages the records through the parts
const PagingShortcuts = () => {
    const control = useDatasetControl()
    return <Stack horizontal tokens={{ childrenGap: 8 }}>
        <DefaultButton text='Pages of 10' onClick={() => control.parts.get('pageSizeSwitcher').setPageSize(10)} />
        <DefaultButton text='First page' onClick={() => control.parts.get('pagination').moveFirst()} />
    </Stack>
}

const GridExample = () => <DatasetControl stateKey='pagingDeals' onLoad={async () => ({ provider: createDealsProvider() })} height='440px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <PagingShortcuts />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
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

export const RibbonExample = () => <GridExampleRunner seedCode={withFiles(RIBBON_CODE, RIBBON_FILE)} tabs={['preview', 'code']} />
export const QuickFindExample = () => <GridExampleRunner seedCode={QUICK_FIND_CODE} tabs={['preview', 'code']} />
export const EditColumnsExample = () => <GridExampleRunner seedCode={withFiles(EDIT_COLUMNS_CODE, VIEWS_FILE)} tabs={['preview', 'code']} />
export const NotificationsExample = () => <GridExampleRunner seedCode={NOTIFICATIONS_CODE} tabs={['preview', 'code']} />
export const EmptyStateExample = () => <GridExampleRunner seedCode={EMPTY_STATE_CODE} tabs={['preview', 'code']} />
export const PagingExample = () => <GridExampleRunner seedCode={PAGING_CODE} tabs={['preview', 'code']} />
