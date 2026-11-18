import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import type { IGridExampleFile } from '../../../grid/GridLivePreview'
import { DEAL_LIST_TABS, DEALS_RIBBON_FILE, USER_VIEW_TYPES_FILE, USER_VIEWS_FILE, withDealList } from '../dealListFiles'

const YOUR_OWN_UI_CODE = `import { ClientSideGrid, createEditingModule, createRowSelectionModule, createSortingModule, DatasetControl, useDataProviderEvents, useProvideDatasetControlPart } from '@talxis/base-controls'
import { IDataProvider } from '@talxis/client-libraries'
import { Text } from '@fluentui/react'
import { loadDeals } from './deals'
import { DealsRibbon } from './DealsRibbon'
import { dealViews, saveDealViewData } from './userViews'

const getTotal = (provider: IDataProvider) => provider.getSelectedRecordIds().reduce((sum, id) => sum + Number(provider.getRecordsMap()[id].getValue('value')), 0)

//new: a part of your own that redraws on every selection
const SelectedValue = () => {
    const provider = useDataProviderEvents(['onRecordsSelected'])
    //new: provides it for control.parts under the key types.ts declares
    useProvideDatasetControlPart('selectedValue', () => ({ getTotal: () => getTotal(provider) }))
    return <Text>Selected: {getTotal(provider).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</Text>
}

const GridExample = () => <DatasetControl modules={[dealViews]} onLoad={loadDeals} onSetup={saveDealViewData} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher>
                <DatasetControl.UserQueries />
            </DatasetControl.ViewSwitcher>
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <DealsRibbon />
            <DatasetControl.EditColumns />
            {/* new: a callout slot that adds each column's logical name */}
            <DatasetControl.QuickFind components={{ callout: { onRenderColumn: ({ column }) => <Text>{column.displayName} ({column.name})</Text> } }} />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Notifications messages={[{ text: 'Deals are synced from the CRM every night.', level: 'INFO' }]} />
    <DatasetControl.Body>
        <ClientSideGrid modules={[createRowSelectionModule({ mode: 'multiple' }), createEditingModule(), createSortingModule()]} />
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

const SELECTED_VALUE_TYPES_FILE: IGridExampleFile = {
    name: 'types.ts',
    code: USER_VIEW_TYPES_FILE.code.replace('        searchQuery: string\n    }\n', `        searchQuery: string
    }
    //new: the part SelectedValue provides
    interface IDatasetControlPartMap {
        selectedValue: { getTotal(): number }
    }
`),
}

const BOARD_PER_VIEW_CODE = `import { ClientSideGrid, DatasetControl, IDatasetControlView, useDatasetControl } from '@talxis/base-controls'
import { columns, loadDeals } from './deals'
import { DealBoard } from './DealBoard'

//new: what a view carries besides its columns
interface IDealViewData {
    ui: 'board'
}

//new: a view whose data asks for the board
const BOARD: IDatasetControlView = {
    id: 'board',
    name: 'Board',
    resolve: () => ({ columns: columns('name', 'owner', 'stage', 'value'), data: { ui: 'board' } }),
}

const loadDealsAndBoard = async () => {
    const { provider, views = [] } = await loadDeals()
    return { provider, views: [...views, BOARD] }
}

//new: the body reads its view once per load
const DealsBody = () => {
    const isBoard = useDatasetControl<IDealViewData>().getView()?.data?.ui === 'board'
    //the empty state in place of either while no deal matches
    return <DatasetControl.EmptyState>
        {isBoard ? <DealBoard /> : <ClientSideGrid />}
    </DatasetControl.EmptyState>
}

const GridExample = () => <DatasetControl onLoad={loadDealsAndBoard} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <DealsBody />
    </DatasetControl.Body>
</DatasetControl>
`

const DEAL_BOARD_FILE: IGridExampleFile = {
    name: 'DealBoard.tsx',
    code: `import { useDataProviderEvents, useTheme } from '@talxis/base-controls'
import { IRecord } from '@talxis/client-libraries'
import { ITheme, mergeStyleSets, Text } from '@fluentui/react'

const getDealBoardStyles = (theme: ITheme) => mergeStyleSets({
    board: { display: 'flex', gap: 12, height: '100%', overflowX: 'auto', boxSizing: 'border-box' },
    column: { flex: '0 0 220px', display: 'flex', flexDirection: 'column', minHeight: 0, borderRadius: 8, background: theme.palette.neutralLighter },
    header: { display: 'flex', justifyContent: 'space-between', padding: '10px 12px' },
    cards: { flex: 1, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', padding: '0 8px 8px' },
    card: { display: 'flex', flexDirection: 'column', gap: 4, padding: 10, borderRadius: 6, background: theme.palette.white, boxShadow: theme.effects.elevation4 },
})

//the deals in a column per stage
export const DealBoard = () => {
    const provider = useDataProviderEvents(['onNewDataLoaded'])
    const theme = useTheme()
    const styles = React.useMemo(() => getDealBoardStyles(theme), [theme])
    const stages = new Map<number, IRecord[]>()
    for (const deal of provider.getRecords()) {
        //an option set's value comes back as a string
        const stage = Number(deal.getValue('stage'))
        stages.set(stage, [...stages.get(stage) ?? [], deal])
    }

    return <div className={styles.board}>
        {[...stages].sort(([a], [b]) => a - b).map(([stage, deals]) => <div key={stage} className={styles.column}>
            <div className={styles.header}>
                <Text styles={{ root: { fontWeight: 600 } }}>{deals[0].getFormattedValue('stage')}</Text>
                <Text variant='small'>{deals.length}</Text>
            </div>
            <div className={styles.cards}>
                {deals.map(deal => <div key={deal.getRecordId()} className={styles.card}>
                    <Text styles={{ root: { fontWeight: 600 } }}>{deal.getFormattedValue('name')}</Text>
                    <Text variant='small'>{deal.getFormattedValue('owner')}</Text>
                    <Text>{deal.getFormattedValue('value')}</Text>
                </div>)}
            </div>
        </div>)}
    </div>
}
`,
}

export const YourOwnUiExample = () => <GridExampleRunner seedCode={withDealList(YOUR_OWN_UI_CODE, DEALS_RIBBON_FILE, USER_VIEWS_FILE, SELECTED_VALUE_TYPES_FILE)} tabs={DEAL_LIST_TABS} />
//the board draws no grid for the Data tab to follow
export const BoardPerViewExample = () => <GridExampleRunner seedCode={withDealList(BOARD_PER_VIEW_CODE, DEAL_BOARD_FILE)} tabs={['preview', 'code']} />
