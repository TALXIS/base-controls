import type { IGridExampleFile } from '../../../grid/GridLivePreview'

export const GRID_EXAMPLE_FILE: IGridExampleFile = {
    name: 'GridExample.tsx',
    code: `import { getDefinition, loadDeals, loadSystemViews } from './views'
import { createUserQueriesProvider, readViewData, writeViewData } from './userQueries'
import { DealsBody } from './DealsBody'

const GridExample = () => {
    const userQueriesProvider = React.useMemo(() => createUserQueriesProvider(), [])
    const datasetControlModules = React.useMemo(() => [createUserQueriesModule({ provider: userQueriesProvider, onReadViewData: readViewData, onWriteViewData: writeViewData })], [])

    //every view, system or saved by the user, carries what it shows in its data
    const onLoad = async (params: IDatasetControlLoadParameters) => ({ provider: await loadDeals(getDefinition(params.view)) })

    return <DatasetControl modules={datasetControlModules} onLoadViews={loadSystemViews} onLoad={onLoad} stateKey='scratch-user-queries' height='600px'>
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
            <DealsBody />
        </DatasetControl.Body>
    </DatasetControl>
}
`,
}
