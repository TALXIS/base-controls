import type { IDatasetControlLoadParameters, IDatasetControlLoadResult, IDatasetControlView } from '@talxis/base-controls'
import { DataTypes, IAvailableColumnOptions, IAvailableRelatedColumn, IColumn, MemoryDataProvider } from '@talxis/client-libraries'
import { DEAL_COLUMNS, DEAL_PRIMARY_ID, DEAL_ROWS } from '../grid/data'

interface IDealView extends IDatasetControlView {
    columns: string[]
    sorting?: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[]
    filtering?: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression
}

const DEAL_VIEWS: IDealView[] = [
    { id: 'all', name: 'All deals', columns: ['name', 'owner', 'stage', 'value', 'probability', 'closedate'] },
    {
        id: 'won',
        name: 'Won deals',
        columns: ['name', 'owner', 'value', 'closedate'],
        filtering: { filterOperator: 0, conditions: [{ attributeName: 'stage', conditionOperator: 0, value: '4' }] },
    },
    { id: 'biggest', name: 'Biggest deals', group: { id: 'reports', name: 'Reports' }, columns: ['name', 'value', 'stage'], sorting: [{ name: 'value', sortDirection: 1 }] },
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

//the deals as one view shows them
const createViewProvider = (view: IDealView) => {
    const provider = new MemoryDataProvider({
        dataSource: DEAL_ROWS.map(row => ({ ...row })),
        metadata: { PrimaryIdAttribute: DEAL_PRIMARY_ID, PrimaryNameAttribute: 'name', LogicalName: 'docs_deal', EntitySetName: 'docs_deals' },
        columns: DEAL_COLUMNS.map(column => ({ ...column, isPrimary: column.name === 'name', isHidden: !view.columns.includes(column.name), order: view.columns.indexOf(column.name) })),
    })
    provider.setSorting(view.sorting ?? [])
    provider.setFiltering(view.filtering ?? null)
    provider.setViewId(view.id)
    //what Edit columns offers, the columns of a deal's account included
    provider.onGetAvailableColumns = async (options?: IAvailableColumnOptions) => options?.entityName === ACCOUNT_SCOPE.relatedEntityName ? ACCOUNT_COLUMNS : DEAL_COLUMNS
    provider.onGetAvailableRelatedColumns = async () => [ACCOUNT_SCOPE]
    return provider
}

/** A deals provider for the view asked for, the first view when none is; loads like a server would. */
export const loadDeals = async (params: IDatasetControlLoadParameters): Promise<IDatasetControlLoadResult> => {
    await new Promise(resolve => setTimeout(resolve, 600))
    const view = DEAL_VIEWS.find(view => view.id === params.view?.id) ?? DEAL_VIEWS[0]
    return { provider: createViewProvider(view) }
}

/** The deal views, for the view switcher; loads like a server would. */
export const loadDealViews = async (): Promise<IDatasetControlView[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return DEAL_VIEWS.map(({ id, name, group }) => ({ id, name, group }))
}
