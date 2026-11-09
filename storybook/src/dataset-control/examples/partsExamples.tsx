import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../grid/GridLivePreview'
import { VIEWS_FILE, withFiles } from './shared'

const RIBBON_CODE = `import { DealsRibbon } from './DealsRibbon'

const NEGOTIATE_STAGE = 3

//adds a command to whatever ribbon the control draws
const addSelectCommand = (control: IDatasetControl) => {
    control.parts.observe('ribbon', ribbon => ribbon.hooks.commands.add(commands => {
        commands.push({ id: 'selectNegotiating', label: 'Select deals in negotiation', iconName: 'MultiSelect', onExecute: () => {
            const provider = control.getProvider()!
            provider.setSelectedRecordIds(provider.getRecords().filter(deal => Number(deal.getValue('stage')) === NEGOTIATE_STAGE).map(deal => deal.getRecordId()))
        } })
    }))
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: createDealsProvider() })} onSetup={addSelectCommand} height='440px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DealsRibbon />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <ClientSideGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createEditingModule()]} />
    </DatasetControl.Body>
</DatasetControl>
`

const RIBBON_FILE: IGridExampleFile = {
    name: 'DealsRibbon.tsx',
    code: `const WON_STAGE = 4

//DatasetControl.Ribbon calls onLoad again on every selection
export const DealsRibbon = () => {
    const provider = useDataProvider()
    const control = useDatasetControl()

    //saved at once, so it leaves no unsaved changes behind
    const markWon = async (recordIds: string[]) => {
        const records = recordIds.map(id => provider.getRecordsMap()[id])
        records.forEach(record => record.setValue('stage', WON_STAGE))
        await provider.save(records)
        //the selection is the same, but which commands apply to it is not
        await control.parts.get('ribbon').reload()
    }

    const onLoad = async (): Promise<IRibbonCommand[]> => {
        const openIds = provider.getSelectedRecordIds().filter(id => Number(provider.getRecordsMap()[id].getValue('stage')) !== WON_STAGE)
        return openIds.length > 0 ? [{ id: 'markWon', label: \`Mark \${openIds.length} as won\`, iconName: 'Trophy2', onExecute: () => markWon(openIds) }] : []
    }

    //the built-in commands, each off unless asked for
    return <DatasetControl.Ribbon enableSave enableDiscard enableRefresh onLoad={onLoad} />
}
`,
}

const QUICK_FIND_CODE = `const GridExample = () => {
    const [draft, setDraft] = React.useState('')

    //follows the query as it is typed, before it is searched
    const onSetup = (control: IDatasetControl) => {
        control.parts.observe('quickFind', quickFind => quickFind.events.addEventListener('onQueryChanged', () => setDraft(quickFind.getQuery())))
    }

    return <Stack tokens={{ childrenGap: 8 }}>
        <DatasetControl onLoad={async () => ({ provider: createDealsProvider() })} onSetup={onSetup} height='440px'>
            <DatasetControl.Header>
                <DatasetControl.Header.End>
                    <DatasetControl.QuickFind />
                </DatasetControl.Header.End>
            </DatasetControl.Header>
            <DatasetControl.Body>
                <ClientSideGrid />
            </DatasetControl.Body>
        </DatasetControl>
        <Text>Typed: {draft}</Text>
    </Stack>
}
`

const EDIT_COLUMNS_CODE = `import { loadDeals } from './views'

//adds a command above the column pickers
const addCommands = (control: IDatasetControl) => {
    control.parts.observe('editColumns', editColumns => editColumns.hooks.commands.add((commands, session) => {
        commands.push({ key: 'keepOnlyTheDeal', text: 'Keep only the deal', iconProps: { iconName: 'ClearFilter' }, onClick: () => {
            session.getColumns().filter(column => column.name !== 'name').forEach(column => session.removeColumn(column.name))
        } })
    }))
}

//opens the column editor from a button of your own
const ColumnsButton = () => {
    const control = useDatasetControl()
    return <DefaultButton text='Columns' iconProps={{ iconName: 'ColumnOptions' }} onClick={() => control.parts.get('editColumns').open()} />
}

const GridExample = () => <DatasetControl onLoad={loadDeals} onSetup={addCommands} height='440px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <DatasetControl.EditColumns />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <ClientSideGrid />
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

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: createDealsProvider() })} height='440px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <BreakTheConnection />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Notifications messages={[{ text: 'Deals are synced from the CRM every night.', level: 'INFO' }]} />
    <DatasetControl.Body>
        <ClientSideGrid />
    </DatasetControl.Body>
</DatasetControl>
`

const EMPTY_STATE_CODE = `//a list of your own, which has no empty state of its own
const DealList = () => {
    const provider = useDataProviderEvents(['onNewDataLoaded'])
    return <div style={{ height: '100%', overflow: 'auto' }}>
        {provider.getRecords().map(deal => <Text key={deal.getRecordId()} block>{deal.getFormattedValue('name')}</Text>)}
    </div>
}

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: createDealsProvider() })} height='360px'>
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

const GridExample = () => <DatasetControl onLoad={async () => ({ provider: createDealsProvider() })} height='440px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <PagingShortcuts />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <ClientSideGrid />
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
