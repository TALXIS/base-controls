import type { IGridExampleFile } from '../../../grid/GridLivePreview'

export const GRID_EXAMPLE_FILE: IGridExampleFile = {
    name: 'GridExample.tsx',
    code: `import { loadDeals, loadSystemViews } from './views'
import { createDealUserQueriesModule } from './userQueries'
import { DealsBody } from './DealsBody'

const GridExample = () => {
    const datasetControlModules = React.useMemo(() => [createDealUserQueriesModule()], [])

    return <DatasetControl modules={datasetControlModules} onLoadViews={loadSystemViews} onLoad={loadDeals} stateKey='scratch-user-queries' height='600px'>
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
