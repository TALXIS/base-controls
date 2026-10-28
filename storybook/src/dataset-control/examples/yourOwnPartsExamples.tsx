import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { VIEWS_FILE, withFiles } from './shared'

const SELECTED_VALUE_CODE = `import { loadDeals, loadDealViews } from './views'

//a part of your own: the total value of the selected deals
const SelectedValue = () => {
    const provider = useDataProviderEvents(['onRecordsSelected'])
    const total = provider.getSelectedRecordIds().reduce((sum, id) => sum + (provider.getRecordsMap()[id].getValue('value') ?? 0), 0)
    return <Text styles={{ root: { alignSelf: 'center' } }}>Selected: {total.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</Text>
}

const GridExample = () => <DatasetControl onLoadViews={loadDealViews} stateKey='deals' onLoad={loadDeals} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <DatasetControl.EditColumns />
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <Grid stateKey='grid' modules={[createClientSideRowModelModule(), createRowSelectionModule({ mode: 'multiple' })]} />
    </DatasetControl.Body>
    <DatasetControl.Footer>
        <DatasetControl.Footer.Start>
            <SelectedValue />
        </DatasetControl.Footer.Start>
    </DatasetControl.Footer>
</DatasetControl>
`

export const SelectedValueExample = () => <GridExampleRunner seedCode={withFiles(SELECTED_VALUE_CODE, VIEWS_FILE)} />
