import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { VIEWS_FILE, withFiles } from './shared'

const USER_VIEWS_CODE = `import { createDealViewDataModule, IDealViewData, loadDeals, loadDealViews } from './views'

const GridExample = () => {
    //the columns are kept for you and come back from the provider; createDealViewDataModule registers what else a view keeps
    const modules = React.useMemo(() => [createLocalStorageUserQueriesModule<IDealViewData>({ storageKey: 'docs.dealViews' }), createDealViewDataModule()], [])

    return <DatasetControl modules={modules} onLoadViews={loadDealViews} onLoad={loadDeals} stateKey='userViews' height='480px'>
        <DatasetControl.Header>
            <DatasetControl.Header.Start>
                <DatasetControl.ViewSwitcher>
                    <DatasetControl.UserQueries />
                </DatasetControl.ViewSwitcher>
            </DatasetControl.Header.Start>
            <DatasetControl.Header.End>
                <DatasetControl.EditColumns />
                <DatasetControl.QuickFind />
            </DatasetControl.Header.End>
        </DatasetControl.Header>
        <DatasetControl.Body>
            <Grid stateKey='grid' modules={{ rowModel: createClientSideRowModelModule(), sorting: createSortingModule() }} />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const UserViewsExample = () => <GridExampleRunner seedCode={withFiles(USER_VIEWS_CODE, VIEWS_FILE)} />
