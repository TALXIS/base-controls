import React from 'react'
import { GridExampleRunner } from '../../grid/GridExampleRunner'
import { VIEWS_FILE, withFiles } from './shared'

const A_PART_OF_YOUR_OWN_CODE = `import { loadDeals, loadDealViews } from './views'

//a part of your own: the total value of the selected deals
const SelectedValue = () => {
    const provider = useDataProvider()
    const [, setVersion] = React.useState(0)
    React.useEffect(() => {
        const rerender = () => setVersion(version => version + 1)
        provider.addEventListener('onRecordsSelected', rerender)
        return () => provider.removeEventListener('onRecordsSelected', rerender)
    }, [provider])
    const total = provider.getSelectedRecordIds().reduce((sum, id) => sum + (provider.getRecordsMap()[id].getValue('value') ?? 0), 0)
    return <Text styles={{ root: { alignSelf: 'center' } }}>Selected: {total.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</Text>
}

//buttons that drive the control through its runtime
const Shortcuts = () => {
    const runtime = useRequiredDatasetControlRuntime()
    return <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign='center'>
        <DefaultButton text='Won deals' onClick={() => runtime.reload({ viewId: 'won' })} />
        <DefaultButton text='Search Contoso' onClick={() => { const quickFind = runtime.services.find('quickFind'); quickFind?.setQuery('Contoso'); quickFind?.search() }} />
        <DefaultButton text='Edit columns' onClick={() => runtime.services.find('editColumns')?.open()} />
    </Stack>
}

const GridExample = () => <DatasetControl stateKey='deals' onLoad={loadDeals} height='480px'>
    <DatasetControl.Header>
        <DatasetControl.Header.Start>
            <DatasetControl.ViewSwitcher onLoad={loadDealViews} />
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <Shortcuts />
            <DatasetControl.EditColumns />
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
