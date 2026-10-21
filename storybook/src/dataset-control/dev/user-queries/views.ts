import type { IGridExampleFile } from '../../../grid/GridLivePreview'

export const VIEWS_FILE: IGridExampleFile = {
    name: 'views.ts',
    code: `/** How a view draws the deals. */
export type DealLayout = 'grid' | 'gallery' | 'board' | 'timeline' | 'leaderboard'

/** What a view keeps beside its columns. */
export interface IDealViewData {
    sorting?: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[]
    filtering?: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression | null
    searchQuery?: string
    /** A grid when not given. */
    layout?: DealLayout
}

export const where = (attributeName: string, operator: IOperator, value: string) => ({ filterOperator: 0, conditions: [{ attributeName, conditionOperator: operator.Value, value }] })

/** The full definition of a deal column, by name; also completes the columns a user view keeps. */
export const getDealColumn = (name: string): IColumn | null => {
    const column = DEAL_COLUMNS.find(column => column.name === name)
    return column ? { ...column, isPrimary: name === 'name' } : null
}

//the deal columns a view shows, in the order it shows them
const columns = (...names: string[]) => names.map((name, order) => ({ ...getDealColumn(name)!, order }))
//what a view filters by without showing it
const hidden = (...names: string[]) => names.map(name => ({ ...getDealColumn(name)!, isHidden: true }))

const WON = '4'

const SYSTEM_VIEWS: IDatasetControlView<IDealViewData>[] = [
    { id: 'all', name: 'All deals', resolve: () => ({ columns: columns('name', 'owner', 'stage', 'value', 'probability', 'closedate') }) },
    { id: 'won', name: 'Won deals', resolve: () => ({ columns: [...columns('name', 'owner', 'value', 'closedate'), ...hidden('stage')], data: { filtering: where('stage', Operators.Equal, WON) } }) },
    { id: 'likely', name: 'Likely to close', resolve: () => ({ columns: columns('name', 'owner', 'probability'), data: { filtering: where('probability', Operators.GreaterThanOrEqual, '70') } }) },
    { id: 'pipeline', name: 'Board: Pipeline', resolve: () => ({ columns: columns('name', 'owner', 'stage', 'value'), data: { sorting: [{ name: 'value', sortDirection: 1 }], layout: 'board' } }) },
    { id: 'biggest', name: 'Gallery: Biggest deals', resolve: () => ({ columns: columns('name', 'value', 'stage'), data: { sorting: [{ name: 'value', sortDirection: 1 }], layout: 'gallery' } }) },
    { id: 'closing', name: 'Timeline: Closing dates', resolve: () => ({ columns: [...columns('name', 'owner', 'closedate'), ...hidden('stage')], data: { filtering: where('stage', Operators.LessThan, WON), layout: 'timeline' } }) },
    { id: 'owners', name: 'Leaderboard: Account managers', resolve: () => ({ columns: columns('name', 'owner', 'value'), data: { layout: 'leaderboard' } }) },
]

/** The items, followed by numbered copies of them, so the lists are long enough to scroll. */
export const withCopies = <T extends { id: string, name: string }>(items: T[], rounds: number): T[] => [
    ...items,
    ...Array.from({ length: rounds }, (_, round) => items.map(item => ({ ...item, id: \`\${item.id}-\${round + 2}\`, name: \`\${item.name} \${round + 2}\` }))).flat(),
]

export const loadSystemViews = async (): Promise<IDatasetControlView<IDealViewData>[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return withCopies(SYSTEM_VIEWS, 4)
}

/** What the deals show right now beside their columns, drawn the way the current view draws them. */
export const captureViewData = (datasetControl: IDatasetControl<IDealViewData>): IDealViewData => {
    const provider = datasetControl.getProvider()!
    return { sorting: provider.getSorting(), filtering: provider.getFiltering(), searchQuery: provider.getSearchQuery() || undefined, layout: datasetControl.getView()?.data?.layout }
}

/** The deals as a view shows them; the control sets the view's columns on the provider. */
export const loadDeals = async ({ view }: IDatasetControlLoadParameters<IDealViewData>): Promise<IDatasetControlLoadResult> => {
    await new Promise(resolve => setTimeout(resolve, 600))
    const data = view?.data ?? {}
    const provider = new MemoryDataProvider({
        dataSource: DEAL_ROWS.map(row => ({ ...row })),
        metadata: { PrimaryIdAttribute: DEAL_PRIMARY_ID, PrimaryNameAttribute: 'name', LogicalName: 'docs_deal', EntitySetName: 'docs_deals' },
    })
    provider.setSorting(data.sorting ?? [])
    provider.setFiltering(data.filtering ?? null)
    provider.setSearchQuery(data.searchQuery)
    provider.onGetAvailableColumns = async () => DEAL_COLUMNS
    return { provider }
}
`,
}
