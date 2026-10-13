import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { VIEWS_FILE, withFiles } from './shared'

const A_PART_OF_YOUR_OWN_CODE = `import { loadDealColumns, loadDeals, loadDealViews } from './views'

//a part of your own: the total value of the selected deals
const SelectedValue = () => {
    const provider = useDataProviderEvents(['onRecordsSelected'])
    const total = provider.getSelectedRecordIds().reduce((sum, id) => sum + (provider.getRecordsMap()[id].getValue('value') ?? 0), 0)
    return <Text styles={{ root: { alignSelf: 'center' } }}>Selected: {total.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</Text>
}

//buttons that drive the control
const Shortcuts = () => {
    const control = useDatasetControl()
    return <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign='center'>
        <DefaultButton text='Won deals' onClick={() => control.loadView('won')} />
        <DefaultButton text='Reload' onClick={() => control.reload()} />
        <DefaultButton text='Search Contoso' onClick={() => { const quickFind = control.parts.find('quickFind'); quickFind?.setQuery('Contoso'); quickFind?.search() }} />
        <DefaultButton text='Edit columns' onClick={() => control.parts.find('editColumns')?.open()} />
    </Stack>
}

const GridExample = () => <DatasetControl stateKey='deals' onLoad={loadDeals} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher onLoad={loadDealViews} />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <Shortcuts />
            <DatasetControl.EditColumns onLoadColumns={loadDealColumns} />
            <DatasetControl.QuickFind />
        </DatasetControl.Header.End>
    </DatasetControl.Header>
    <DatasetControl.Body>
        <Grid stateKey='grid' modules={{ rowModel: createClientSideRowModelModule(), rowSelection: createRowSelectionModule({ mode: 'multiple' }) }} />
    </DatasetControl.Body>
    <DatasetControl.Footer>
        <DatasetControl.Footer.Start>
            <SelectedValue />
        </DatasetControl.Footer.Start>
    </DatasetControl.Footer>
</DatasetControl>
`

export const APartOfYourOwnExample = () => <GridExampleRunner seedCode={withFiles(A_PART_OF_YOUR_OWN_CODE, VIEWS_FILE)} />
