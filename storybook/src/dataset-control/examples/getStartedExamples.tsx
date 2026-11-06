import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { RIBBON_FILE, VIEWS_FILE, withFiles } from './shared'

const SHOWCASE_CODE = `import { loadDeals, saveDealViewData } from './views'
import { DealsRibbon } from './DealsRibbon'

const GridExample = () => {
    //the user's own views, kept in localStorage and listed under My views
    const controlModules = React.useMemo(() => [createLocalStorageUserQueriesModule({ storageKey: 'get-started.deals.views' })], [])
    //every grid module, so the grid edits, selects, copies, sorts, filters, groups and totals
    const gridModules = React.useMemo(() => [
        createClientSideRowModelModule(),
        createEditingModule(),
        createRowSelectionModule({ mode: 'multiple' }),
        createCellSelectionModule(),
        createClipboardModule(),
        createSortingModule(),
        createFilteringModule(),
        createGroupingModule(),
        createAggregationModule(),
    ], [])

    //saveDealViewData keeps the sorting, filters and search with every saved view
    return <DatasetControl modules={controlModules} stateKey='deals-get-started' onLoad={loadDeals} onSetup={saveDealViewData} height='560px'>
        {/* every part inside works on the provider onLoad returned */}
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.ViewSwitcher>
                    <DatasetControl.UserQueries />
                </DatasetControl.ViewSwitcher>
            </DatasetControl.Header.Start>
            <DatasetControl.Header.End>
                <DealsRibbon enableSave enableDiscard enableRefresh />
                <DatasetControl.EditColumns />
                <DatasetControl.QuickFind />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Notifications />
        <DatasetControl.Body>
            {/* takes no provider of its own: it draws the control's */}
            <Grid stateKey='grid' modules={gridModules} enableOptionSetColors />
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
}
`

const BASIC_USAGE_CODE = `//your own records, usually fetched from your API
const DEALS = [
    { dealid: '1', name: 'Office chairs', stage: 'Won' },
    { dealid: '2', name: 'Standing desks', stage: 'Open' },
    { dealid: '3', name: 'Meeting room screens', stage: 'Won' },
]

const COLUMNS = [
    { name: 'name', displayName: 'Deal', dataType: DataTypes.SingleLineText },
    { name: 'stage', displayName: 'Stage', dataType: DataTypes.SingleLineText },
]

//the switcher lists the views by name; a view sets the provider up as it opens
const VIEWS: IDatasetControlView[] = [
    { id: 'all', name: 'All deals', resolve: () => ({ columns: COLUMNS }) },
    {
        id: 'won',
        name: 'Won deals',
        resolve: provider => {
            provider.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'stage', conditionOperator: Operators.Equal.Value, value: 'Won' }] })
            return { columns: COLUMNS }
        },
    },
]

//called on every load; returns the provider the parts work on and the views to switch between
const loadDeals = async (): Promise<IDatasetControlLoadResult> => {
    const provider = new MemoryDataProvider({ dataSource: DEALS, metadata: { PrimaryIdAttribute: 'dealid', PrimaryNameAttribute: 'name', LogicalName: 'deal', QuickFindColumns: ['name'] } })
    return { provider, views: VIEWS }
}

const GridExample = () => <DatasetControl onLoad={loadDeals} stateKey='deals-basic-usage' height='320px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        {/* takes no provider of its own: it draws the control's */}
        <Grid stateKey='grid' modules={[createClientSideRowModelModule()]} />
    </DatasetControl.Body>
    <DatasetControl.Footer>
        <DatasetControl.Footer.End>
            <DatasetControl.Pagination />
        </DatasetControl.Footer.End>
    </DatasetControl.Footer>
</DatasetControl>
`

export const BasicUsageExample = () => <GridExampleRunner seedCode={BASIC_USAGE_CODE} tabs={['preview', 'code']} />

export const ShowcaseExample = () => <GridExampleRunner seedCode={withFiles(SHOWCASE_CODE, VIEWS_FILE, RIBBON_FILE)} tabs={['preview', 'code']} />
