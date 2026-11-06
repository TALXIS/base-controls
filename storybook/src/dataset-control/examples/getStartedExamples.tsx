import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { RIBBON_FILE, VIEWS_FILE, withFiles } from './shared'

const SHOWCASE_CODE = `import { IDealViewData, loadDeals, loadDealViews, saveDealViewData } from './views'
import { DealsRibbon } from './DealsRibbon'

const GridExample = () => {
    //the user's own views, kept in localStorage and listed under My views
    const controlModules = React.useMemo(() => [createLocalStorageUserQueriesModule<IDealViewData>({ storageKey: 'get-started.deals.views' })], [])
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
    return <DatasetControl modules={controlModules} onLoadViews={loadDealViews} stateKey='deals-get-started' onLoad={loadDeals} onMounted={saveDealViewData} height='560px'>
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

const BASIC_USAGE_CODE = `interface IDealViewData {
    filtering?: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression
}

//your own records, usually fetched from your API
const DEALS = [
    { dealid: '1', name: 'Office chairs', stage: 'Won' },
    { dealid: '2', name: 'Standing desks', stage: 'Open' },
    { dealid: '3', name: 'Meeting room screens', stage: 'Won' },
]

const COLUMNS = [
    { name: 'name', displayName: 'Deal', dataType: DataTypes.SingleLineText },
    { name: 'stage', displayName: 'Stage', dataType: DataTypes.SingleLineText },
]

//the switcher lists the views by name; what a view shows is resolved when it opens
const loadViews = async (): Promise<IDatasetControlView<IDealViewData>[]> => [
    { id: 'all', name: 'All deals', resolve: () => ({ columns: COLUMNS }) },
    { id: 'won', name: 'Won deals', resolve: () => ({ columns: COLUMNS, data: { filtering: { filterOperator: Type.And.Value, conditions: [{ attributeName: 'stage', conditionOperator: Operators.Equal.Value, value: 'Won' }] } } }) },
]

//called on every load with the view the user is on; returns the provider the parts work on
const loadDeals = async ({ view }: IDatasetControlLoadParameters<IDealViewData>): Promise<IDatasetControlLoadResult> => {
    const provider = new MemoryDataProvider({ dataSource: DEALS, metadata: { PrimaryIdAttribute: 'dealid', PrimaryNameAttribute: 'name', LogicalName: 'deal', QuickFindColumns: ['name'] } })
    //the control sets the view's columns; what else the view carries is yours to apply
    const resolved = view && await view.resolve(provider)
    provider.setFiltering(resolved?.data?.filtering ?? null)
    return { provider }
}

const GridExample = () => <DatasetControl onLoadViews={loadViews} onLoad={loadDeals} stateKey='deals-basic-usage' height='320px'>
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
