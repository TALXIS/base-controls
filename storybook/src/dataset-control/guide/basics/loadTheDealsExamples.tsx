import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { DEAL_LIST_TABS } from '../dealListFiles'

const LOAD_THE_DEALS_CODE = `import { ClientSideGrid, DatasetControl, IDatasetControlLoadResult, IDatasetControlView } from '@talxis/base-controls'
import { IMemoryProviderEntityMetadata, MemoryDataProvider, Operators, Type } from '@talxis/client-libraries'

//the docs dataset's deals, kept outside onLoad
const deals = DEAL_ROWS.map(row => ({ ...row }))

const metadata: IMemoryProviderEntityMetadata = { PrimaryIdAttribute: DEAL_PRIMARY_ID, PrimaryNameAttribute: 'name', LogicalName: 'docs_deal', QuickFindColumns: ['name'] }

//offers every deal column to the views
class DealsProvider extends MemoryDataProvider {
    public async onGetAvailableColumns() {
        //the provider sorts the array it gets
        return [...DEAL_COLUMNS]
    }
}

//a view's columns by name, in the order it shows them
const columns = (...names: string[]) => names.map((name, order) => ({ name, order }))

//new: the views of the signed-in user
const createDealViews = (user: string): IDatasetControlView[] => [
    {
        //new: the user's own deals, first in the list
        id: 'my',
        name: 'My deals',
        resolve: provider => {
            provider.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'owner', conditionOperator: Operators.Equal.Value, value: user }] })
            return { columns: [...columns('name', 'stage', 'value', 'closedate'), { name: 'owner', isHidden: true }] }
        },
    },
    { id: 'all', name: 'All deals', resolve: () => ({ columns: columns('name', 'owner', 'stage', 'value', 'probability', 'closedate') }) },
    {
        id: 'won',
        name: 'Won deals',
        resolve: provider => {
            provider.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'stage', conditionOperator: Operators.Equal.Value, value: '4' }] })
            return { columns: [...columns('name', 'owner', 'value', 'closedate'), { name: 'stage', isHidden: true }] }
        },
    },
    {
        id: 'biggest',
        name: 'Biggest deals',
        group: { id: 'reports', name: 'Reports' },
        resolve: provider => {
            //sortDirection 1 is descending
            provider.setSorting([{ name: 'value', sortDirection: 1 }])
            return { columns: columns('name', 'value', 'stage') }
        },
    },
]

//new: stands in for asking the server who is signed in
const loadSignedInUser = async () => {
    await new Promise(resolve => setTimeout(resolve, 600))
    return 'Anna Novak'
}

//called on every load for the provider the parts work on
const loadDeals = async (): Promise<IDatasetControlLoadResult> => {
    //new: what the views need comes first
    const user = await loadSignedInUser()
    //new: the views are built for the signed-in user
    return { provider: new DealsProvider({ dataSource: deals, metadata }), views: createDealViews(user) }
}

const GridExample = () => <DatasetControl onLoad={loadDeals} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <ClientSideGrid />
    </DatasetControl.Body>
</DatasetControl>
`

export const LoadTheDealsExample = () => <GridExampleRunner seedCode={LOAD_THE_DEALS_CODE} tabs={DEAL_LIST_TABS} />
