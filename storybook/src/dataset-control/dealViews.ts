import type { IDatasetControlLoadResult, IDatasetControlView } from '@talxis/base-controls'
import { DataTypes, IAvailableRelatedColumn, IColumn, MemoryDataProvider } from '@talxis/client-libraries'
import { DEAL_COLUMNS, DEAL_PRIMARY_ID, DEAL_ROWS } from '../grid/data'

//the deal name is what quick find searches
const DEALS = DEAL_COLUMNS.map(column => ({ ...column, isPrimary: column.name === 'name' }))
const getDealColumn = (name: string): IColumn => DEALS.find(column => column.name === name)!

//the deal columns a view shows, in the order it shows them
const columns = (...names: string[]) => names.map((name, order) => ({ ...getDealColumn(name), order }))
//what a view filters by without showing it
const hidden = (...names: string[]) => names.map(name => ({ ...getDealColumn(name), isHidden: true }))

const DEAL_VIEWS: IDatasetControlView[] = [
    { id: 'all', name: 'All deals', resolve: () => ({ columns: columns('name', 'owner', 'stage', 'value', 'probability', 'closedate') }) },
    {
        id: 'won',
        name: 'Won deals',
        resolve: provider => {
            provider.setFiltering({ filterOperator: 0, conditions: [{ attributeName: 'stage', conditionOperator: 0, value: '4' }] })
            return { columns: [...columns('name', 'owner', 'value', 'closedate'), ...hidden('stage')] }
        },
    },
    {
        id: 'biggest',
        name: 'Biggest deals',
        group: { id: 'reports', name: 'Reports' },
        resolve: provider => {
            provider.setSorting([{ name: 'value', sortDirection: 1 }])
            return { columns: columns('name', 'value', 'stage') }
        },
    },
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

//offers a deal's account as a column source in Edit columns
class DealsProvider extends MemoryDataProvider {
    public async onGetAvailableRelatedColumns(): Promise<IAvailableRelatedColumn[]> {
        return [ACCOUNT_SCOPE]
    }
}

const createDealsProvider = () => {
    const provider = new DealsProvider({
        dataSource: DEAL_ROWS.map(row => ({ ...row })),
        metadata: { PrimaryIdAttribute: DEAL_PRIMARY_ID, PrimaryNameAttribute: 'name', LogicalName: 'docs_deal', EntitySetName: 'docs_deals' },
    })
    //offers the account's columns in the account scope and the deal's elsewhere
    provider.hooks.availableColumns.add((columns, options) => columns.push(...(options?.entityName === ACCOUNT_SCOPE.relatedEntityName ? ACCOUNT_COLUMNS : DEALS)))
    return provider
}

/** The deals provider and its views; loads like a server would. */
export const loadDeals = async (): Promise<IDatasetControlLoadResult> => {
    await new Promise(resolve => setTimeout(resolve, 600))
    return { provider: createDealsProvider(), views: DEAL_VIEWS }
}
