import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { VIEWS_FILE, withFiles } from './shared'

const WAITING_CODE = `import { loadDeals, loadDealViews } from './views'

//loadDeals, in views.ts, runs on every load: the first mount and every view switch
const GridExample = () => <DatasetControl onLoadViews={loadDealViews} stateKey='deals-loading-data' onLoad={loadDeals} height='420px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
    </DatasetControl.Header>
    {/* a placeholder stands in for the parts until onLoad's provider has its first page */}
    <DatasetControl.Body>
        <Grid stateKey='grid' modules={[createClientSideRowModelModule()]} />
    </DatasetControl.Body>
</DatasetControl>
`

const DEPENDENCIES_CODE = `//stands in for fetching the signed-in user
const loadUser = async () => {
    await new Promise(resolve => setTimeout(resolve, 600))
    return { name: 'Anna Novak' }
}

const VIEWS: IDatasetControlView[] = [
    { id: 'mine', name: 'My deals', resolve: () => ({ columns: DEAL_COLUMNS }) },
    { id: 'all', name: 'All deals', resolve: () => ({ columns: DEAL_COLUMNS }) },
]

const GridExample = () => {
    const controlRef = React.useRef<IDatasetControl>()

    const loadDeals = async ({ view }: IDatasetControlLoadParameters): Promise<IDatasetControlLoadResult> => {
        //loaded by loadUser before onLoad on every mount
        const user = controlRef.current!.getDependencies<{ name: string }>()
        const provider = createDealsProvider()
        await view!.resolve(provider)
        if (view!.id === 'mine') {
            provider.setFiltering({ filterOperator: Type.And.Value, conditions: [{ attributeName: 'owner', conditionOperator: Operators.Equal.Value, value: user.name }] })
        }
        return { provider }
    }

    //onMounted hands over the control before its load
    return <DatasetControl onLoadDependencies={loadUser} onLoadViews={async () => VIEWS} onLoad={loadDeals} onMounted={control => controlRef.current = control} stateKey='deals-dependencies' height='420px'>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.ViewSwitcher />
            </DatasetControl.Header.Start>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <Grid stateKey='grid' modules={[createClientSideRowModelModule()]} />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const WaitingExample = () => <GridExampleRunner seedCode={withFiles(WAITING_CODE, VIEWS_FILE)} tabs={['preview', 'code']} />
export const DependenciesExample = () => <GridExampleRunner seedCode={DEPENDENCIES_CODE} tabs={['preview', 'code']} />
