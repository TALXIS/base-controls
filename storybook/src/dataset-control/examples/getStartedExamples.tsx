import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { RIBBON_FILE, VIEWS_FILE, withFiles } from './shared'

const SHOWCASE_CODE = `import { loadDeals, loadDealViews } from './views'
import { DealsRibbon } from './DealsRibbon'

const GridExample = () => <DatasetControl stateKey='deals' onLoad={loadDeals} height='560px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher onLoad={loadDealViews} />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <DealsRibbon />
            <DatasetControl.EditColumns />
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Notifications />
    <DatasetControl.Body>
        <Grid
            stateKey='grid'
            modules={{ rowModel: createClientSideRowModelModule(), rowSelection: createRowSelectionModule({ mode: 'multiple' }), sorting: createSortingModule() }} />
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
`

export const ShowcaseExample = () => <GridExampleRunner seedCode={withFiles(SHOWCASE_CODE, VIEWS_FILE, RIBBON_FILE)} />
