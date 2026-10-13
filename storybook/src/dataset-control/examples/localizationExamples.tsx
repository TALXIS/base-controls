import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { VIEWS_FILE, withFiles } from './shared'

const CZECH_CODE = `import { loadDeals, loadDealViews } from './views'

const GridExample = () => <DatasetControl stateKey='deals' onLoad={loadDeals} labels={{ unsavedChangesConfirmation: 'Neuložené změny budou ztraceny. Pokračovat?' }} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher onLoad={loadDealViews} labels={{ ungroupedViewsHeader: 'Systémová zobrazení' }} />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <DatasetControl.EditColumns labels={{ editColumns: 'Upravit sloupce', save: 'Uložit', cancel: 'Zrušit', columnSelectorPlaceholder: 'Přidat sloupec...', noResults: 'Nic nenalezeno.' }} />
            <DatasetControl.QuickFind labels={{ searchPlaceholder: 'Hledat {{ collection }}...', defaultCollectionName: 'záznamy', columnsHintStart: 'Použít filtr', columnsHintOperator: 'začíná na', columnsHintEnd: 'na tyto sloupce:' }} />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <Grid stateKey='grid' modules={{ rowModel: createClientSideRowModelModule() }} labels={{ noRecordsFound: 'Žádné záznamy.' }} />
    </DatasetControl.Body>
    <DatasetControl.Footer>
        <DatasetControl.Footer.Start>
            <DatasetControl.PageSizeSwitcher labels={{ recordTotal: 'z {{ total }}', pageSizeTooltip: 'Záznamů na stránku' }} />
        </DatasetControl.Footer.Start>
        <DatasetControl.Footer.End>
            <DatasetControl.Pagination labels={{ firstPageTooltip: 'První stránka', previousPageTooltip: 'Předchozí', nextPageTooltip: 'Další', currentPage: 'Stránka {{ number }}' }} />
        </DatasetControl.Footer.End>
    </DatasetControl.Footer>
</DatasetControl>
`

export const CzechExample = () => <GridExampleRunner seedCode={withFiles(CZECH_CODE, VIEWS_FILE)} />
