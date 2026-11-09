import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { VIEWS_FILE, withFiles } from './shared'

const WAITING_CODE = `import { loadDeals } from './views'

//loadDeals, in views.ts, runs on every load: the first mount and every view switch
const GridExample = () => <DatasetControl onLoad={loadDeals} height='420px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    {/* a placeholder stands in for the parts until onLoad's provider has its first page */}
    <DatasetControl.Body>
        <ClientSideGrid />
    </DatasetControl.Body>
</DatasetControl>
`

const DEPENDENCIES_CODE = `//stands in for fetching the signed-in user
const loadUser = async () => {
    await new Promise(resolve => setTimeout(resolve, 600))
    return { name: 'Anna Novak' }
}

//loaded first on every mount, so the views can read the user
const loadDeals = async (): Promise<IDatasetControlLoadResult> => {
    const user = await loadUser()
    const views: IDatasetControlView[] = [
        {
            id: 'mine',
            name: 'My deals',
            resolve: provider => {
                provider.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'owner', conditionOperator: Operators.Equal.Value, value: user.name }] })
                return { columns: DEAL_COLUMNS }
            },
        },
        { id: 'all', name: 'All deals', resolve: () => ({ columns: DEAL_COLUMNS }) },
    ]
    return { provider: createDealsProvider(), views }
}

const GridExample = () => <DatasetControl onLoad={loadDeals} height='420px'>
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

export const WaitingExample = () => <GridExampleRunner seedCode={withFiles(WAITING_CODE, VIEWS_FILE)} tabs={['preview', 'code']} />
export const DependenciesExample = () => <GridExampleRunner seedCode={DEPENDENCIES_CODE} tabs={['preview', 'code']} />
