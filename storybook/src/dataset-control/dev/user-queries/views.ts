import type { IGridExampleFile } from '../../../grid/GridLivePreview'

export const VIEWS_FILE: IGridExampleFile = {
    name: 'views.ts',
    code: `/** How a view draws the deals. */
export type DealLayout = 'grid' | 'gallery' | 'board' | 'timeline' | 'leaderboard'

/** What a view of the deals shows. */
export interface IDealViewDefinition {
    columns: string[]
    sorting?: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[]
    filtering?: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression | null
    searchQuery?: string
    /** A grid when not given. */
    layout?: DealLayout
}

export const where = (attributeName: string, operator: IOperator, value: string) => ({ filterOperator: 0, conditions: [{ attributeName, conditionOperator: operator.Value, value }] })

const WON = '4'

const SYSTEM_VIEWS: IDatasetControlView[] = [
    { id: 'all', name: 'All deals', data: { definition: { columns: ['name', 'owner', 'stage', 'value', 'probability', 'closedate'] } } },
    { id: 'won', name: 'Won deals', data: { definition: { columns: ['name', 'owner', 'value', 'closedate'], filtering: where('stage', Operators.Equal, WON) } } },
    { id: 'likely', name: 'Likely to close', data: { definition: { columns: ['name', 'owner', 'probability'], filtering: where('probability', Operators.GreaterThanOrEqual, '70') } } },
    { id: 'pipeline', name: 'Board: Pipeline', data: { definition: { columns: ['name', 'owner', 'stage', 'value'], sorting: [{ name: 'value', sortDirection: 1 }], layout: 'board' } } },
    { id: 'biggest', name: 'Gallery: Biggest deals', data: { definition: { columns: ['name', 'value', 'stage'], sorting: [{ name: 'value', sortDirection: 1 }], layout: 'gallery' } } },
    { id: 'closing', name: 'Timeline: Closing dates', data: { definition: { columns: ['name', 'owner', 'closedate'], filtering: where('stage', Operators.LessThan, WON), layout: 'timeline' } } },
    { id: 'owners', name: 'Leaderboard: Account managers', data: { definition: { columns: ['name', 'owner', 'value'], layout: 'leaderboard' } } },
]

/** The items, followed by numbered copies of them, so the lists are long enough to scroll. */
export const withCopies = <T extends { id: string, name: string }>(items: T[], rounds: number): T[] => [
    ...items,
    ...Array.from({ length: rounds }, (_, round) => items.map(item => ({ ...item, id: \`\${item.id}-\${round + 2}\`, name: \`\${item.name} \${round + 2}\` }))).flat(),
]

export const loadSystemViews = async (): Promise<IDatasetControlView[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return withCopies(SYSTEM_VIEWS, 4)
}

/** What every view, system or saved by the user, carries in its data. */
export interface IDealViewData {
    definition: IDealViewDefinition
}

/** The view's definition; the first system view's without one. */
export const getDefinition = (view: IDatasetControlView | undefined): IDealViewDefinition => {
    return (view?.data as IDealViewData | undefined)?.definition ?? (SYSTEM_VIEWS[0].data as IDealViewData).definition
}

/** The view the control shows. */
export const getCurrentView = (control: IDatasetControl) => control.getViews().find(view => view.id === control.getViewId())

/** What the provider shows right now, as a definition to save. */
export const readDefinition = (provider: IDataProvider): IDealViewDefinition => ({
    columns: provider.getColumns().filter(column => !column.isHidden).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map(column => column.name),
    sorting: provider.getSorting(),
    filtering: provider.getFiltering(),
    searchQuery: provider.getSearchQuery() || undefined,
})

/** The deals as the definition shows them; loads like a server would. */
export const loadDeals = async (definition: IDealViewDefinition): Promise<IDataProvider> => {
    await new Promise(resolve => setTimeout(resolve, 600))
    const provider = new MemoryDataProvider({
        dataSource: DEAL_ROWS.map(row => ({ ...row })),
        metadata: { PrimaryIdAttribute: DEAL_PRIMARY_ID, PrimaryNameAttribute: 'name', LogicalName: 'docs_deal', EntitySetName: 'docs_deals' },
        columns: DEAL_COLUMNS.map(column => ({ ...column, isPrimary: column.name === 'name', isHidden: !definition.columns.includes(column.name), order: definition.columns.indexOf(column.name) })),
    })
    provider.setSorting(definition.sorting ?? [])
    provider.setFiltering(definition.filtering ?? null)
    provider.setSearchQuery(definition.searchQuery)
    provider.onGetAvailableColumns = async () => DEAL_COLUMNS
    return provider
}
`,
}
