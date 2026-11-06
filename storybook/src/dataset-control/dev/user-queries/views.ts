import type { IGridExampleFile } from '../../../grid/GridLivePreview'

export const VIEWS_FILE: IGridExampleFile = {
    name: 'views.ts',
    code: `/** How a view draws the deals. */
export type DealLayout = 'grid' | 'gallery' | 'board' | 'timeline' | 'leaderboard'

/** What a user view keeps beside its columns. */
export interface IDealViewData {
    sorting?: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[]
    filtering?: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression | null
    searchQuery?: string
    /** A grid when not given. */
    layout?: DealLayout
}

declare module '@talxis/base-controls' {
    interface IUserQuerySavedValueMap {
        sorting: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[]
        filtering: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression | null
        searchQuery: string
        layout: DealLayout
    }
}

export const where = (attributeName: string, operator: IOperator, value: string) => ({ filterOperator: 0, conditions: [{ attributeName, conditionOperator: operator.Value, value }] })

//the deal name is what quick find searches
const DEALS = DEAL_COLUMNS.map(column => ({ ...column, isPrimary: column.name === 'name' }))
const getDealColumn = (name: string) => DEALS.find(column => column.name === name)!

//the deal columns a view shows, in the order it shows them
const columns = (...names: string[]) => names.map((name, order) => ({ ...getDealColumn(name), order }))
//what a view filters by without showing it
const hidden = (...names: string[]) => names.map(name => ({ ...getDealColumn(name), isHidden: true }))

const WON = '4'

const byValue = (provider: IDataProvider) => provider.setSorting([{ name: 'value', sortDirection: 1 }])

const SYSTEM_VIEWS: IDatasetControlView<IDealViewData>[] = [
    { id: 'all', name: 'All deals', resolve: () => ({ columns: columns('name', 'owner', 'stage', 'value', 'probability', 'closedate') }) },
    {
        id: 'won',
        name: 'Won deals',
        resolve: provider => {
            provider.setFiltering(where('stage', Operators.Equal, WON))
            return { columns: [...columns('name', 'owner', 'value', 'closedate'), ...hidden('stage')] }
        },
    },
    {
        id: 'likely',
        name: 'Likely to close',
        resolve: provider => {
            provider.setFiltering(where('probability', Operators.GreaterThanOrEqual, '70'))
            return { columns: columns('name', 'owner', 'probability') }
        },
    },
    {
        id: 'pipeline',
        name: 'Board: Pipeline',
        resolve: provider => {
            byValue(provider)
            return { columns: columns('name', 'owner', 'stage', 'value'), data: { layout: 'board' } }
        },
    },
    {
        id: 'biggest',
        name: 'Gallery: Biggest deals',
        resolve: provider => {
            byValue(provider)
            return { columns: columns('name', 'value', 'stage'), data: { layout: 'gallery' } }
        },
    },
    {
        id: 'closing',
        name: 'Timeline: Closing dates',
        resolve: provider => {
            provider.setFiltering(where('stage', Operators.LessThan, WON))
            return { columns: [...columns('name', 'owner', 'closedate'), ...hidden('stage')], data: { layout: 'timeline' } }
        },
    },
    { id: 'owners', name: 'Leaderboard: Account managers', resolve: () => ({ columns: columns('name', 'owner', 'value'), data: { layout: 'leaderboard' } }) },
]

/** The items, followed by numbered copies of them, so the lists are long enough to scroll. */
export const withCopies = <T extends { id: string, name: string }>(items: T[], rounds: number): T[] => [
    ...items,
    ...Array.from({ length: rounds }, (_, round) => items.map(item => ({ ...item, id: \`\${item.id}-\${round + 2}\`, name: \`\${item.name} \${round + 2}\` }))).flat(),
]

/** Saves what the deals show beside their columns with every user view and puts it back as it opens. */
export const createDealViewDataModule = (): IDatasetControlModule => ({
    name: 'dealViewData',
    onLoad: datasetControl => {
        const provider = () => datasetControl.getProvider()!
        datasetControl.modules.observe('userQueries', userQueries => {
            const unsaveWithViews = [
                userQueries.saveWithView('sorting', () => provider().getSorting(), (sorting, provider) => provider.setSorting(sorting)),
                userQueries.saveWithView('filtering', () => provider().getFiltering(), (filtering, provider) => provider.setFiltering(filtering)),
                userQueries.saveWithView('searchQuery', () => provider().getSearchQuery() || undefined, (searchQuery, provider) => provider.setSearchQuery(searchQuery)),
                userQueries.saveWithView('layout', () => datasetControl.getView()?.data?.layout),
            ]
            return () => unsaveWithViews.forEach(unsaveWithView => unsaveWithView())
        })
        return {}
    },
})

//offers every deal column to Edit columns and user views, not only the ones a view shows
class DealsProvider extends MemoryDataProvider {
    public async onGetAvailableColumns() {
        return DEALS
    }
}

/** The deals and the system views; the control opens a view on the provider. */
export const loadDeals = async (): Promise<IDatasetControlLoadResult> => {
    await new Promise(resolve => setTimeout(resolve, 600))
    const provider = new DealsProvider({
        dataSource: DEAL_ROWS.map(row => ({ ...row })),
        metadata: { PrimaryIdAttribute: DEAL_PRIMARY_ID, PrimaryNameAttribute: 'name', LogicalName: 'docs_deal', EntitySetName: 'docs_deals' },
    })
    return { provider, views: withCopies(SYSTEM_VIEWS, 4) }
}
`,
}
