import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { VIEWS_FILE, withFiles } from './shared'

const CZECH_CODE = `import { IDealViewData, loadDeals, loadDealViews, saveDealViewData } from './views'

const labels = { ...CZECH_LABELS, 'quickFind.searchPlaceholder': 'Hledat obchody...' }

const GridExample = () => {
    const modules = React.useMemo(() => [createLocalStorageUserQueriesModule<IDealViewData>({ storageKey: 'docs.czechDealViews' })], [])

    return <LocalizationProvider labels={labels}>
        <DatasetControl modules={modules} onLoadViews={loadDealViews} onLoad={loadDeals} onMounted={saveDealViewData} stateKey='czechDeals' height='480px'>
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
            <DatasetControl.Footer>
                <DatasetControl.Footer.Start>
                    <DatasetControl.PageSizeSwitcher />
                </DatasetControl.Footer.Start>
                <DatasetControl.Footer.End>
                    <DatasetControl.Pagination />
                </DatasetControl.Footer.End>
            </DatasetControl.Footer>
        </DatasetControl>
    </LocalizationProvider>
}
`

export const CzechExample = () => <GridExampleRunner seedCode={withFiles(CZECH_CODE, VIEWS_FILE)} />
