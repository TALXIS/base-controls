import type { IDatasetControlLoadParameters, IDatasetControlLoadResult, IDatasetControlView, IDatasetControlViewDefinition } from '@talxis/base-controls'
import { DataTypes, IAvailableColumnOptions, IAvailableRelatedColumn, IColumn, MemoryDataProvider } from '@talxis/client-libraries'
import { DEAL_COLUMNS, DEAL_PRIMARY_ID, DEAL_ROWS } from '../grid/data'

/** What a deal view keeps beside its columns. */
export interface IDealViewData {
    sorting?: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[]
    filtering?: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression
}

//the full definition of a deal column, by name
const getDealColumn = (name: string): IColumn => ({ ...DEAL_COLUMNS.find(column => column.name === name)!, isPrimary: name === 'name' })

//the deal columns a view shows, in the order it shows them
const columns = (...names: string[]) => names.map((name, order) => ({ ...getDealColumn(name), order }))
//what a view filters by without showing it
const hidden = (...names: string[]) => names.map(name => ({ ...getDealColumn(name), isHidden: true }))

const DEAL_VIEWS: IDatasetControlView<IDealViewData>[] = [
    { id: 'all', name: 'All deals', resolve: () => ({ columns: columns('name', 'owner', 'stage', 'value', 'probability', 'closedate') }) },
    {
        id: 'won',
        name: 'Won deals',
        resolve: () => ({
            columns: [...columns('name', 'owner', 'value', 'closedate'), ...hidden('stage')],
            data: { filtering: { filterOperator: 0, conditions: [{ attributeName: 'stage', conditionOperator: 0, value: '4' }] } },
        }),
    },
    { id: 'biggest', name: 'Biggest deals', group: { id: 'reports', name: 'Reports' }, resolve: () => ({ columns: columns('name', 'value', 'stage'), data: { sorting: [{ name: 'value', sortDirection: 1 }] } }) },
]

const ACCOUNT_SCOPE = {
    name: 'accountid',
    displayName: 'Account',
    relatedEntityName: 'docs_account',
    relatedEntityDisplayName: 'Account',
    relatedEntityPrimaryIdAttribute: 'docs_accountid',
    dataType: DataTypes.LookupSimple,
    metadata: { Targets: ['docs_account'] },
} as IAvailableRelatedColumn

const ACCOUNT_COLUMNS: IColumn[] = [
    { name: 'name', displayName: 'Account name', dataType: DataTypes.SingleLineText },
    { name: 'city', displayName: 'City', dataType: DataTypes.SingleLineText },
]

//the deals for one view; the control sets the view's columns on it
const createViewProvider = (view: IDatasetControlViewDefinition<IDealViewData>) => {
    const provider = new MemoryDataProvider({
        dataSource: DEAL_ROWS.map(row => ({ ...row })),
        metadata: { PrimaryIdAttribute: DEAL_PRIMARY_ID, PrimaryNameAttribute: 'name', LogicalName: 'docs_deal', EntitySetName: 'docs_deals' },
    })
    provider.setSorting(view.data?.sorting ?? [])
    provider.setFiltering(view.data?.filtering ?? null)
    //what Edit columns offers, the columns of a deal's account included
    provider.onGetAvailableColumns = async (options?: IAvailableColumnOptions) => options?.entityName === ACCOUNT_SCOPE.relatedEntityName ? ACCOUNT_COLUMNS : DEAL_COLUMNS
    provider.onGetAvailableRelatedColumns = async () => [ACCOUNT_SCOPE]
    return provider
}

/** A deals provider for the view asked for, the first view when none is; loads like a server would. */
export const loadDeals = async (params: IDatasetControlLoadParameters<IDealViewData>): Promise<IDatasetControlLoadResult> => {
    await new Promise(resolve => setTimeout(resolve, 600))
    const view = params.view ?? await DEAL_VIEWS[0].resolve()
    const provider = createViewProvider(view)
    if (params.view) {
        provider.setViewId(params.view.id)
    }
    return { provider }
}

/** The deal views, for the view switcher; loads like a server would. */
export const loadDealViews = async (): Promise<IDatasetControlView<IDealViewData>[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return DEAL_VIEWS
}
