import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { VIEWS_FILE, withFiles } from './shared'

const USER_VIEWS_CODE = `import { IDealViewData, loadDeals, loadDealViews, saveDealViewData } from './views'

const GridExample = () => {
    const modules = React.useMemo(() => [createLocalStorageUserQueriesModule<IDealViewData>({ storageKey: 'docs.dealViews' })], [])

    return <DatasetControl modules={modules} onLoadViews={loadDealViews} onLoad={loadDeals} onMounted={saveDealViewData} stateKey='userViews' height='480px'>
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
            <Grid stateKey='grid' modules={[createClientSideRowModelModule(), createSortingModule()]} />
        </DatasetControl.Body>
    </DatasetControl>
}
`

export const UserViewsExample = () => <GridExampleRunner seedCode={withFiles(USER_VIEWS_CODE, VIEWS_FILE)} />
