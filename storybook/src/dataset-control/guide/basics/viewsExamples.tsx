import React from 'react'
import { GridExampleRunner } from '../../../grid/GridExampleRunner'
import { DEAL_LIST_TABS } from '../dealListFiles'

const VIEWS_CODE = `import { ClientSideGrid, DatasetControl, IDatasetControlLoadResult, IDatasetControlView } from '@talxis/base-controls'
import { IMemoryProviderEntityMetadata, MemoryDataProvider, Operators, Type } from '@talxis/client-libraries'

//the docs dataset's deals, kept outside onLoad
const deals = DEAL_ROWS.map(row => ({ ...row }))

const metadata: IMemoryProviderEntityMetadata = { PrimaryIdAttribute: DEAL_PRIMARY_ID, PrimaryNameAttribute: 'name', LogicalName: 'docs_deal', QuickFindColumns: ['name'] }

//new: offers every deal column to the views
class DealsProvider extends MemoryDataProvider {
    public async onGetAvailableColumns() {
        //new: the provider sorts the array it gets
        return [...DEAL_COLUMNS]
    }
}

//new: a view's columns by name, in the order it shows them
const columns = (...names: string[]) => names.map((name, order) => ({ name, order }))

//new: each view sets the provider up as it opens, and returns its columns
const VIEWS: IDatasetControlView[] = [
    { id: 'all', name: 'All deals', resolve: () => ({ columns: columns('name', 'owner', 'stage', 'value', 'probability', 'closedate') }) },
    {
        id: 'won',
        name: 'Won deals',
        resolve: provider => {
            provider.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'stage', conditionOperator: Operators.Equal.Value, value: '4' }] })
            //new: lists the column it filters by, hidden
            return { columns: [...columns('name', 'owner', 'value', 'closedate'), { name: 'stage', isHidden: true }] }
        },
    },
    {
        id: 'biggest',
        name: 'Biggest deals',
        //new: the header the view is listed under
        group: { id: 'reports', name: 'Reports' },
        resolve: provider => {
            //new: sortDirection 1 is descending
            provider.setSorting([{ name: 'value', sortDirection: 1 }])
            return { columns: columns('name', 'value', 'stage') }
        },
    },
]

//called on every load for the provider the parts work on
const loadDeals = async (): Promise<IDatasetControlLoadResult> => ({
    //new: the open view sets its columns
    provider: new DealsProvider({ dataSource: deals, metadata }),
    //new: the first view opens first
    views: VIEWS,
})

const GridExample = () => <DatasetControl onLoad={loadDeals} height='480px'>
    {/* new: the row above the records */}
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            {/* new: lists the views and opens the one picked */}
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <ClientSideGrid />
    </DatasetControl.Body>
</DatasetControl>
`

export const ViewsExample = () => <GridExampleRunner seedCode={VIEWS_CODE} tabs={DEAL_LIST_TABS} />
